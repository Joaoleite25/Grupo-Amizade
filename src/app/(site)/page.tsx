import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowRight, HeartHandshake, Sparkles, Sun } from "lucide-react";
import { getAbout, getActivities, getNews } from "@/lib/data";
import { excerpt, formatDate } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Container, SectionHeading } from "@/components/site/section";
import { NewsCarousel } from "@/components/site/news-carousel";
import { ActivityCard } from "@/components/site/activity-card";
import { NewsCard } from "@/components/site/news-card";

export default function HomePage() {
  return (
    <>
      <Hero />
      <UpcomingActivities />
      <AboutPreview />
      <LatestNews />
      <JoinCta />
    </>
  );
}

async function Hero() {
  "use cache";
  cacheLife("hours");
  const news = await getNews({ limit: 5 });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-accent/10 blur-3xl"
      />
      <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            Associação juvenil · São João de Ver
          </p>
          <h1 className="text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Crescer juntos,{" "}
            <span className="font-display font-normal text-accent italic">em amizade.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Ocupação dos tempos livres, educação para a paz e campanhas de solidariedade. Um espaço onde os jovens
            descobrem, decidem e fazem acontecer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/atividades" className={buttonClass("primary", "lg")}>
              Ver atividades <ArrowRight />
            </Link>
            <Link href="/sobre" className={buttonClass("secondary", "lg")}>
              Conhecer o grupo
            </Link>
          </div>
          <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
            {[
              { icon: Sun, label: "Tempos livres" },
              { icon: Sparkles, label: "Educação para a paz" },
              { icon: HeartHandshake, label: "Solidariedade" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-soft-fg">
                  <Icon className="size-4" />
                </span>
                <span className="font-medium leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {news.length > 0 ? (
          <NewsCarousel
            slides={news.map((n) => ({
              id: n.id,
              title: n.title,
              excerpt: excerpt(n.body, 140),
              imageDesktop: n.imageDesktop,
              imageMobile: n.imageMobile,
              date: formatDate(n.createdAt),
            }))}
          />
        ) : (
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent-soft via-surface to-internal-soft">
            <span aria-hidden className="dove size-48 text-accent/30" />
          </div>
        )}
      </Container>
    </section>
  );
}

async function UpcomingActivities() {
  "use cache";
  cacheLife("minutes");
  const now = new Date();
  const upcoming = (await getActivities("EXTERNAL")).filter((a) => a.date >= now).slice(0, 3);

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow="Agenda"
          title="Próximas atividades"
          description="Inscreve-te diretamente no site. Algumas atividades têm vagas limitadas."
          href="/atividades"
          linkLabel="Todas as atividades"
        />
        {upcoming.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((a) => (
              <ActivityCard key={a.id} activity={a} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState title="Ainda não há atividades marcadas">Volta em breve — estamos a preparar novidades.</EmptyState>
        )}
      </Container>
    </section>
  );
}

async function AboutPreview() {
  "use cache";
  cacheLife("hours");
  const sections = await getAbout();
  if (!sections.length) return null;
  const [first, ...rest] = sections;

  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-10 rounded-3xl border border-border bg-surface p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-2 text-sm font-semibold text-accent">Quem somos</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{first!.title}</h2>
            <Link
              href="/sobre"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-all hover:gap-2.5"
            >
              Saber mais sobre o grupo <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed whitespace-pre-line text-fg/90">{first!.body}</p>
            {rest.length > 0 && (
              <dl className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                {rest.slice(0, 2).map((s) => (
                  <div key={s.id}>
                    <dt className="font-semibold">{s.title}</dt>
                    <dd className="mt-1 text-sm text-muted">{excerpt(s.body, 140)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

async function LatestNews() {
  "use cache";
  cacheLife("hours");
  const news = await getNews({ limit: 3 });
  if (!news.length) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Notícias" title="O que temos andado a fazer" href="/noticias" linkLabel="Todas as notícias" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <NewsCard key={n.id} news={n} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function JoinCta() {
  return (
    <section className="pt-8">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-accent px-8 py-12 text-accent-fg sm:px-12 sm:py-16">
          <span aria-hidden className="dove absolute -right-6 -bottom-10 size-64 opacity-15" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Queres participar?</h2>
            <p className="mt-3 text-lg opacity-85">
              Cria a tua conta para te inscreveres nas atividades e acompanhares as tuas inscrições.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registar"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 font-medium text-stone-900 shadow-sm transition-colors hover:bg-stone-100"
              >
                Criar conta <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/entrar"
                className="inline-flex h-12 items-center rounded-lg px-6 font-medium ring-1 ring-current/30 transition-colors hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
