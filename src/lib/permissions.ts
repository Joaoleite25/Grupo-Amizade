import type { Permission } from "@/generated/prisma/enums";

export type { Permission };

// Descrição de cada permissão, mostrada na matriz de permissões do Master.
export const PERMISSIONS: { key: Permission; label: string; description: string }[] = [
  { key: "INTERNAL_ACTIVITIES", label: "Atividades internas", description: "Ver e inscrever-se em atividades internas do grupo." },
  { key: "VIEW_REGISTRATIONS", label: "Inscrições", description: "Ver quem está inscrito em cada atividade e quantas pessoas." },
  { key: "MANAGE_USERS", label: "Utilizadores", description: "Alterar o nível de utilizadores com nível inferior." },
  { key: "EDIT_FOOTER", label: "Editar rodapé", description: "Alterar as informações do rodapé (morada, contactos...)." },
  { key: "CREATE_FOOTER", label: "Criar rodapé", description: "Criar e apagar informações e redes sociais do rodapé." },
  { key: "MANAGE_NEWS", label: "Notícias", description: "Criar, editar e apagar notícias do carrossel." },
  { key: "MANAGE_ABOUT", label: "Sobre", description: "Criar e editar os textos de apresentação do grupo." },
  { key: "MANAGE_ACTIVITIES", label: "Atividades", description: "Criar, editar e apagar atividades." },
  { key: "MANAGE_ROLES", label: "Permissões", description: "Definir o que cada nível pode fazer (só o Master)." },
];

// O nível mais alto (Master) tem sempre todas as permissões e não pode ser
// editado — evita que alguém fique trancado fora da gestão do site.
export const MASTER_LEVEL = 4;

export const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.key);
