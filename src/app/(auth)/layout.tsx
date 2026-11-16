import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/misc";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Início">
            <Logo />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Voltar ao site
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
      <div className="relative hidden overflow-hidden bg-accent lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.18),transparent_55%)]" />
        <span aria-hidden className="dove absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 text-white/20" />
        <blockquote className="absolute inset-x-12 bottom-12 text-accent-fg">
          <p className="font-display text-4xl leading-tight italic">
            “Ajudar os jovens a envolverem-se nas descobertas e nas decisões.”
          </p>
          <footer className="mt-4 text-sm opacity-75">Grupo Amizade · São João de Ver</footer>
        </blockquote>
      </div>
    </div>
  );
}
