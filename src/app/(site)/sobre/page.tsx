import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Info } from "lucide-react";
import { getAbout } from "@/lib/data";
import { EmptyState } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/site/section";

export const metadata: Metadata = { title: "Sobre" };

export default async function AboutPage() {
  "use cache";
  cacheLife("hours");
  const sections = await getAbout();

  return (
    <>
      <PageHero
        eyebrow="Sobre nós"
        title={
          <>
            Uma associação feita <span className="font-display font-normal text-accent italic">por</span> e{" "}
            <span className="font-display font-normal text-accent italic">para</span> jovens.
          </>
        }
      />
      <Container className="py-14">
        {sections.length ? (
          <div className="grid gap-12 lg:grid-cols-[14rem_1fr]">
            <nav aria-label="Secções" className="hidden lg:block">
              <ul className="sticky top-24 space-y-1 border-l border-border">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted hover:border-accent hover:text-fg">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="max-w-2xl space-y-14">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.title}</h2>
                  <p className="mt-4 text-lg leading-relaxed whitespace-pre-line text-fg/85">{s.body}</p>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState icon={<Info />} title="Ainda não há textos sobre o grupo" />
        )}
      </Container>
    </>
  );
}
