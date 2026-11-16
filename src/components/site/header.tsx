import Link from "next/link";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/misc";
import { initials } from "@/lib/utils";
import { MobileMenu, NavLinks } from "@/components/site/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Grupo Amizade — início" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          {/* usePathname só existe no pedido: fallback sem o link ativo */}
          <Suspense fallback={<NavLinks static />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-lg bg-surface-2" />}>
            <AccountButton />
          </Suspense>
          <Suspense fallback={<div className="size-10 md:hidden" />}>
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

/** Mostra "Entrar" ou o acesso à área reservada (lê a sessão, por isso está em Suspense). */
async function AccountButton() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/entrar" className={buttonClass("primary", "md")}>
        Entrar
      </Link>
    );
  }
  return (
    <Link href="/area" className={buttonClass("secondary", "md", "pl-1.5")}>
      <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-xs font-semibold text-accent-soft-fg">
        {initials(user.name)}
      </span>
      <span className="hidden sm:inline">Área reservada</span>
      <LayoutDashboard className="sm:hidden" />
    </Link>
  );
}
