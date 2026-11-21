import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ChevronDown, MailCheck, Search, UserPlus } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Container, PageHero } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Como participar",
  description: "Como criar conta, inscrever-te nas atividades do Grupo Amizade e o que acontece a seguir.",
};

const STEPS = [
  {
    icon: UserPlus,
    title: "Cria a tua conta",
    body: "Só precisas de nome, email, data de nascimento e uma palavra-passe. Demora um minuto.",
  },
  {
    icon: Search,
    title: "Escolhe uma atividade",
    body: "Vê a agenda em lista ou no calendário. Cada atividade diz quando é, onde, para que idades e quantas vagas restam.",
  },
  {
    icon: CalendarCheck,
    title: "Inscreve-te",
    body: "Indica quantas pessoas vão contigo. Se as vagas esgotarem, ficas na lista de espera por ordem de chegada.",
  },
  {
    icon: MailCheck,
    title: "Recebe a confirmação",
    body: "Enviamos-te um email com os detalhes e um botão para pores a atividade no calendário do telemóvel.",
  },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Preciso de conta para me inscrever?",
    a: (
      <>
        Sim. A conta serve para guardar as tuas inscrições e para te avisarmos de alterações. Podes{" "}
        <Link href="/registar" className="font-medium text-accent hover:underline">
          criá-la aqui
        </Link>
        . Para ver as atividades e as notícias não precisas de conta.
      </>
    ),
  },
  {
    q: "Posso inscrever amigos ou familiares?",
    a: "Sim. Na inscrição escolhes o número de pessoas (até 20). Todas ficam na tua inscrição.",
  },
  {
    q: "E se as vagas esgotarem?",
    a: "Podes entrar na lista de espera. Se alguém cancelar, as inscrições em espera são confirmadas automaticamente, por ordem de chegada, e recebes um email a avisar.",
  },
  {
    q: "Como altero ou cancelo uma inscrição?",
    a: (
      <>
        Na{" "}
        <Link href="/area/inscricoes" className="font-medium text-accent hover:underline">
          área reservada → Minhas inscrições
        </Link>{" "}
        podes mudar o número de pessoas ou cancelar até ao dia da atividade. Se já não puderes ir, cancela: a vaga passa
        para quem está à espera.
      </>
    ),
  },
  {
    q: "O que são atividades internas?",
    a: "São atividades só para os membros do grupo (por exemplo, reuniões de preparação). Só aparecem a quem tem sessão iniciada com essa permissão.",
  },
  {
    q: "Esqueci-me da palavra-passe. E agora?",
    a: (
      <>
        Usa a opção{" "}
        <Link href="/recuperar-password" className="font-medium text-accent hover:underline">
          recuperar palavra-passe
        </Link>{" "}
        e recebes um link por email para definires uma nova.
      </>
    ),
  },
  {
    q: "O que fazem com os meus dados?",
    a: (
      <>
        Usamos os dados só para gerir as inscrições e a tua conta, e podes apagar a conta quando quiseres. Lê a{" "}
        <Link href="/privacidade" className="font-medium text-accent hover:underline">
          política de privacidade
        </Link>
        .
      </>
    ),
  },
];

export default function HowToJoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Como participar"
        title={
          <>
            Da conta à atividade em{" "}
            <span className="font-display font-normal text-accent italic">quatro passos.</span>
          </>
        }
        description="Tudo o que precisas de saber para te juntares a nós nas próximas atividades."
      />

      <Container className="py-14 sm:py-20">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative rounded-2xl border border-border bg-surface p-6">
              <span className="absolute top-5 right-5 font-display text-4xl text-accent/25 italic tabular-nums" aria-hidden>
                {i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-soft-fg">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 font-semibold tracking-tight">
                <span className="sr-only">Passo {i + 1}: </span>
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/registar" className={buttonClass("primary", "lg")}>
            Criar conta <ArrowRight />
          </Link>
          <Link href="/atividades" className={buttonClass("secondary", "lg")}>
            Ver atividades
          </Link>
        </div>

        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16" aria-labelledby="faq">
          <div>
            <p className="mb-2 text-sm font-semibold text-accent">Perguntas frequentes</p>
            <h2 id="faq" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Ainda tens dúvidas?
            </h2>
            <p className="mt-3 text-muted">
              Se não encontrares a resposta aqui, fala connosco pelos contactos no fundo da página.
            </p>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium">
                  {q}
                  <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="-mt-1 pb-5 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
