import type { Metadata } from "next";
import { Suspense } from "react";
import { can, requireUser, type CurrentUser } from "@/lib/auth";
import { Sidebar, type NavGroup } from "@/components/area/sidebar";

export const metadata: Metadata = {
  title: { default: "Área reservada", template: "%s · Área reservada" },
  robots: { index: false },
};

/** As opções da sidebar dependem das permissões do nível do utilizador. */
function navFor(user: CurrentUser): NavGroup[] {
  const manage = [
    can(user, "VIEW_REGISTRATIONS") && { href: "/area/gestao/inscricoes", label: "Inscrições", icon: "registrations" },
    can(user, "MANAGE_USERS") && { href: "/area/gestao/utilizadores", label: "Utilizadores", icon: "users" },
    can(user, "MANAGE_ACTIVITIES") && { href: "/area/gestao/atividades", label: "Atividades", icon: "activities" },
    can(user, "MANAGE_NEWS") && { href: "/area/gestao/noticias", label: "Notícias", icon: "news" },
    can(user, "MANAGE_ABOUT") && { href: "/area/gestao/sobre", label: "Sobre", icon: "about" },
    (can(user, "EDIT_FOOTER") || can(user, "CREATE_FOOTER")) && { href: "/area/gestao/rodape", label: "Informações", icon: "footer" },
    can(user, "MANAGE_ROLES") && { href: "/area/gestao/permissoes", label: "Permissões", icon: "roles" },
  ].filter(Boolean) as NavGroup["items"];

  return [
    {
      items: [
        { href: "/area", label: "Painel", icon: "dashboard" },
        { href: "/area/inscricoes", label: "Minhas inscrições", icon: "ticket" },
        { href: "/area/perfil", label: "Perfil", icon: "user" },
      ],
    },
    ...(manage.length ? [{ label: "Gestão", items: manage }] : []),
  ];
}

async function AreaSidebar() {
  const user = await requireUser();
  return <Sidebar groups={navFor(user)} name={user.name} role={user.role.name} />;
}

export default function AreaLayout({ children }: LayoutProps<"/area">) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg lg:flex-row">
      <Suspense fallback={<div className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block" />}>
        <AreaSidebar />
      </Suspense>
      <main id="conteudo" className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
