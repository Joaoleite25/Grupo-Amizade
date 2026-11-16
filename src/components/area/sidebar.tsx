"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PanelBottom,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/ui/misc";
import { cn, initials } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  ticket: Ticket,
  user: UserRound,
  registrations: ClipboardList,
  users: Users,
  activities: CalendarDays,
  news: Newspaper,
  about: Info,
  footer: PanelBottom,
  roles: ShieldCheck,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };
export type NavGroup = { label?: string; items: NavItem[] };

function NavList({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Área reservada" className="space-y-6">
      {groups.map((g, i) => (
        <div key={i}>
          {g.label && <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.href === "/area" ? pathname === "/area" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-accent-soft text-accent-soft-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserBox({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-sm font-semibold text-accent-soft-fg">
        {initials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted">{role}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          title="Terminar sessão"
          aria-label="Terminar sessão"
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

function SidebarBody({ groups, name, role }: { groups: NavGroup[]; name: string; role: string }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/" className="px-2 pt-1" aria-label="Ir para o site">
        <Logo />
      </Link>
      <div className="flex-1 overflow-y-auto">
        <NavList groups={groups} />
      </div>
      <div className="space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          <ExternalLink className="size-4" /> Ver o site
        </Link>
        <UserBox name={name} role={role} />
      </div>
    </div>
  );
}

export function Sidebar({ groups, name, role }: { groups: NavGroup[]; name: string; role: string }) {
  const pathname = usePathname();
  // Guarda a página onde a gaveta foi aberta: ao navegar fecha sozinha.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);

  return (
    <>
      {/* Computador: barra lateral fixa */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-surface lg:block">
        <SidebarBody groups={groups} name={name} role={role} />
      </aside>

      {/* Telemóvel: barra no topo + gaveta */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
        <Link href="/area">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg hover:bg-surface-2"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="absolute top-4 right-3 grid size-9 place-items-center rounded-lg hover:bg-surface-2"
            >
              <X className="size-5" />
            </button>
            <SidebarBody groups={groups} name={name} role={role} />
          </div>
        </div>
      )}
    </>
  );
}
