import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowRight, HeartHandshake, Sparkles, Sun } from "lucide-react";
import { getAbout, getActivities, getImpactStats, getNews, getSettings } from "@/lib/data";
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
      <ImpactStats />
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
  const [news, settings] = await Promise.all([getNews({ limit: 5 }), getSettings()]);
  const slides = news.map((n) => ({
    id: n.id,
    title: n.title,
    excerpt: excerpt(n.body, 140),
    imageDesktop: n.imageDesktop,
    imageMobile: n.imageMobile,
    date: formatDate(n.createdAt),
  }));

  // Com uma foto do grupo definida na área reservada, o topo passa a ser a foto
  // e o carrossel das notícias desce para uma secção própria.
  if (settings.heroImage) {
    return (
      <>
        <PhotoHero image={settings.heroImage} alt={settings.heroAlt ?? ""} />
        {slides.length > 0 && (
          <section className="pt-16">
            <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
              <SectionHeading
                eyebrow="Em destaque"
                title="O que temos andado a fazer"
                description="As notícias mais recentes do grupo."
                href="/noticias"
                linkLabel="Todas as notícias"
              />
              <NewsCarousel slides={slides} />
            </Container>
          </section>
        )}
      </>
    );
  }

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
            {PILLARS.map(({ icon: Icon, label }) => (
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
          <NewsCarousel slides={slides} />
        ) : (
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent-soft via-surface to-internal-soft">
            <span aria-hidden className="dove size-48 text-accent/30" />
          </div>
        )}
      </Container>
    </section>
  );
}

const PILLARS = [
  { icon: Sun, label: "Tempos livres" },
  { icon: Sparkles, label: "Educação para a paz" },
  { icon: HeartHandshake, label: "Solidariedade" },
];

function PhotoHero({ image, alt }: { image: string; alt: string }) {
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="relative isolate flex min-h-[34rem] items-end overflow-hidden rounded-[2rem] bg-stone-900 sm:min-h-[40rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-stone-950/5"
        />
        <Container className="pt-32 pb-10 text-white sm:pb-14">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-teal-300" />
            Associação juvenil · São João de Ver
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Crescer juntos, <span className="font-display font-normal text-teal-200 italic">em amizade.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            Ocupação dos tempos livres, educação para a paz e campanhas de solidariedade. Um espaço onde os jovens
            descobrem, decidem e fazem acontecer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/atividades" className={buttonClass("primary", "lg")}>
              Ver atividades <ArrowRight />
            </Link>
            <Link
              href="/como-participar"
              className="inline-flex h-12 items-center rounded-lg px-6 font-medium ring-1 ring-white/40 backdrop-blur transition-colors hover:bg-white/10"
            >
              Como participar
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/90">
            {PILLARS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-teal-200" /> {label}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}

/** Números do grupo, calculados a partir das atividades e inscrições. */
async function ImpactStats() {
  "use cache";
  cacheLife("hours");
  const stats = await getImpactStats();
  // Sem atividades realizadas ainda não há nada para mostrar.
  if (stats.activities === 0) return null;

  const items = [
    { value: stats.activities, label: stats.activities === 1 ? "atividade realizada" : "atividades realizadas" },
    { value: stats.participations, label: stats.participations === 1 ? "participação em atividades" : "participações em atividades" },
    { value: stats.members, label: stats.members === 1 ? "membro registado" : "membros registados" },
  ].filter((i) => i.value > 0);

  return (
    <section className="pt-16">
      <Container>
        <dl className="grid divide-y divide-border rounded-3xl border border-border bg-surface sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0">
          {items.map((i) => (
            <div key={i.label} className="flex flex-col-reverse gap-1 px-8 py-7 text-center">
              <dt className="text-sm text-muted">{i.label}</dt>
              <dd className="text-4xl font-semibold tracking-tight text-accent tabular-nums sm:text-5xl">
                {i.value.toLocaleString("pt-PT")}
              </dd>
            </div>
          ))}
        </dl>
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
  const [news, settings] = await Promise.all([getNews({ limit: 3 }), getSettings()]);
  // Com a foto no topo, as notícias já aparecem no carrossel "Em destaque".
  if (!news.length || settings.heroImage) return null;

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
                href="/como-participar"
                className="inline-flex h-12 items-center rounded-lg px-6 font-medium ring-1 ring-current/30 transition-colors hover:bg-white/10"
              >
                Como funciona
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
