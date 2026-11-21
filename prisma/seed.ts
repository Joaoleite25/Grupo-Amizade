// Dados iniciais: níveis + permissões, conta Master, textos e rodapé.
// Com SEED_DEMO=true cria também notícias e atividades de exemplo.
// Uso: npm run db:seed  (pode correr várias vezes sem duplicar)
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Permission } from "../src/generated/prisma/enums";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ROLES: { name: string; level: number; permissions: Permission[] }[] = [
  { name: "Utilizador", level: 1, permissions: [] },
  { name: "Staff", level: 2, permissions: ["INTERNAL_ACTIVITIES"] },
  {
    name: "Direção",
    level: 3,
    permissions: [
      "INTERNAL_ACTIVITIES",
      "VIEW_REGISTRATIONS",
      "MANAGE_USERS",
      "EDIT_FOOTER",
      "MANAGE_NEWS",
      "MANAGE_ABOUT",
      "MANAGE_ACTIVITIES",
    ],
  },
  // O Master tem sempre tudo (ver lib/permissions.ts); a lista aqui é só informativa.
  { name: "Master", level: 4, permissions: [] },
];

async function main() {
  for (const r of ROLES) {
    await db.role.upsert({ where: { level: r.level }, update: {}, create: r });
  }
  console.log("✓ Níveis");

  const email = process.env.SEED_MASTER_EMAIL;
  const password = process.env.SEED_MASTER_PASSWORD;
  if (email && password) {
    const master = await db.role.findUniqueOrThrow({ where: { level: 4 } });
    await db.user.upsert({
      where: { email },
      update: {},
      create: {
        username: "master",
        name: "Administrador",
        email,
        birthDate: new Date("2000-01-01"),
        passwordHash: await bcrypt.hash(password, 12),
        roleId: master.id,
      },
    });
    console.log(`✓ Conta Master (${email})`);
  } else {
    console.log("! SEED_MASTER_EMAIL/SEED_MASTER_PASSWORD não definidos — conta Master não criada");
  }

  if ((await db.aboutSection.count()) === 0) {
    await db.aboutSection.createMany({
      data: [
        {
          position: 0,
          title: "Quem somos",
          body: "O Grupo Amizade é uma associação juvenil de São João de Ver que, há mais de três décadas, tem como objetivo ajudar os jovens a envolverem-se nas descobertas e nas decisões. A nossa principal atividade é a ocupação dos tempos livres e a educação para a paz.",
        },
        {
          position: 1,
          title: "Solidariedade e parcerias",
          body: "Para além das nossas atividades, participamos com frequência em campanhas de solidariedade e em parcerias com outras associações da região.",
        },
        {
          position: 2,
          title: "A nossa história",
          body: "Começámos como um grupo informal de amigos. No final de 2004 constituímo-nos juridicamente como associação, e assim nos mantemos até hoje.",
        },
      ],
    });
    console.log("✓ Textos “Sobre”");
  }

  if ((await db.footerItem.count()) === 0) {
    await db.footerItem.createMany({
      data: [
        { kind: "INFO", position: 0, title: "Morada", content: "Rua Sporting Clube de São João de Ver\nApartado 884\n4520-616 São João de Ver" },
        { kind: "INFO", position: 1, title: "Email", content: "gamizade@gmail.com" },
        { kind: "INFO", position: 2, title: "Telefone", content: "910 284 713" },
      ],
    });
    console.log("✓ Rodapé (adiciona as redes sociais na área reservada → Informações)");
  }

  if (process.env.SEED_DEMO === "true") await demo();
}

/**
 * Uma conta de demonstração por nível, para ver a área reservada com os olhos de cada pessoa.
 * Só existe com SEED_DEMO=true (nunca em produção) e usa a password SEED_DEMO_PASSWORD do .env.
 */
async function demoAccounts() {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password) {
    console.log("! SEED_DEMO_PASSWORD não definido — contas de demonstração não criadas");
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const accounts = [
    { username: "utilizador", name: "Utilizador Demo", level: 1, birthDate: "2000-05-10" },
    // Menor de 16 anos: para ver o pedido de autorização do encarregado nas inscrições.
    { username: "jovem", name: "Jovem Demo", level: 1, birthDate: "2013-09-15" },
    { username: "staff", name: "Staff Demo", level: 2, birthDate: "1998-03-22" },
    { username: "direcao", name: "Direção Demo", level: 3, birthDate: "1985-11-02" },
  ];
  for (const a of accounts) {
    const role = await db.role.findUniqueOrThrow({ where: { level: a.level } });
    await db.user.upsert({
      where: { username: a.username },
      update: {},
      create: {
        username: a.username,
        name: a.name,
        email: `${a.username}@grupoamizade.test`,
        birthDate: new Date(a.birthDate),
        passwordHash: hash,
        roleId: role.id,
      },
    });
  }
  console.log(`✓ Contas de demonstração (${accounts.map((a) => a.username).join(", ")})`);
}

async function demo() {
  await demoAccounts();
  if ((await db.news.count()) === 0) {
    await db.news.createMany({
      data: [
        {
          title: "Campanha de recolha de alimentos superou todas as expectativas",
          body: "Durante duas semanas, os jovens do grupo recolheram bens alimentares junto da comunidade.\n\nTudo o que foi recolhido foi entregue a famílias da freguesia. Obrigado a todos os que ajudaram!",
          imageDesktop: "/demo/cover-1.svg",
          createdAt: daysFromNow(-6),
        },
        {
          title: "Dia da Paz: oficinas, música e muitas ideias",
          body: "No Dia Internacional da Paz organizámos oficinas de expressão artística e uma tertúlia sobre o que cada um pode fazer na sua comunidade.",
          imageDesktop: "/demo/cover-2.svg",
          createdAt: daysFromNow(-20),
        },
        {
          title: "Novo ano, novas atividades: já conheces a agenda?",
          body: "Preparámos um calendário cheio para este ano. Cria a tua conta no site para te inscreveres nas atividades.",
          imageDesktop: "/demo/cover-3.svg",
          createdAt: daysFromNow(-40),
        },
      ],
    });
    console.log("✓ Notícias de exemplo");
  }

  if ((await db.activity.count()) === 0) {
    await db.activity.createMany({
      data: [
        {
          title: "Caminhada solidária pelo Rio Uíma",
          description: "Uma caminhada de 8 km pelos trilhos junto ao Rio Uíma. A inscrição reverte para a campanha de Natal.\n\nTraz calçado confortável e água.",
          date: daysFromNow(12, 9),
          registrationOpens: daysFromNow(-3),
          registrationEnds: daysFromNow(10),
          capacity: 40,
          visibility: "EXTERNAL",
          image: "/demo/cover-2.svg",
          location: "Igreja de São João de Ver",
          ages: "A partir dos 10 anos",
          bring: "Calçado confortável, água e um lanche.",
        },
        {
          title: "Workshop de fotografia com telemóvel",
          description: "Aprende a tirar melhores fotografias só com o telemóvel: luz, composição e edição.",
          date: daysFromNow(20, 15),
          registrationOpens: daysFromNow(-1),
          registrationEnds: daysFromNow(18),
          capacity: null,
          visibility: "EXTERNAL",
          ages: "12 aos 18 anos",
          bring: "Telemóvel com a bateria carregada.",
        },
        {
          title: "Reunião de preparação do acampamento",
          description: "Reunião para os membros do grupo organizarem o acampamento de verão.",
          date: daysFromNow(7, 21),
          registrationOpens: daysFromNow(-5),
          registrationEnds: daysFromNow(6),
          capacity: 25,
          visibility: "INTERNAL",
        },
        {
          title: "Noite de jogos de tabuleiro",
          description: "Uma noite descontraída com jogos de tabuleiro para todas as idades.",
          date: daysFromNow(35, 20),
          registrationOpens: daysFromNow(14),
          registrationEnds: daysFromNow(33),
          capacity: 30,
          visibility: "EXTERNAL",
          image: "/demo/cover-3.svg",
        },
        {
          title: "Magusto do grupo",
          description: "Castanhas, música e convívio no adro da igreja.",
          date: daysFromNow(-10, 16),
          registrationOpens: daysFromNow(-30),
          registrationEnds: daysFromNow(-11),
          capacity: null,
          visibility: "EXTERNAL",
          image: "/demo/cover-1.svg",
        },
      ],
    });
    console.log("✓ Atividades de exemplo");
  }
}

function daysFromNow(days: number, hour = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
