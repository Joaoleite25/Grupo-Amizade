"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/noticias", label: "Notícias" },
  { href: "/sobre", label: "Sobre" },
  { href: "/atividades", label: "Atividades" },
  { href: "/como-participar", label: "Como participar" },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks(props: { static?: boolean }) {
  return props.static ? <NavList isActive={() => false} /> : <ActiveNavLinks />;
}

function ActiveNavLinks() {
  return <NavList isActive={useIsActive()} />;
}

function NavList({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <ul className="flex items-center gap-1">
      {NAV.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg",
              "aria-[current=page]:text-fg aria-[current=page]:bg-surface-2",
            )}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const isActive = useIsActive();
  // Guarda a página onde o menu foi aberto: ao mudar de página fecha sozinho.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (fn: (o: boolean) => boolean) => setOpenAt(fn(open) ? pathname : null);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="grid size-10 place-items-center rounded-lg hover:bg-surface-2"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Principal"
          className="absolute inset-x-0 top-16 border-b border-border bg-bg px-4 pb-4 shadow-lg"
        >
          <ul className="grid gap-1 pt-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block rounded-lg px-3 py-3 text-base font-medium aria-[current=page]:bg-surface-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
