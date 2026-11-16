import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { CalendarX, Lock } from "lucide-react";
import { getActivities } from "@/lib/data";
import { can, getCurrentUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui/misc";
import { Container, GridSkeleton, PageHero } from "@/components/site/section";
import { ActivityCard } from "@/components/site/activity-card";
import { ActivityCalendar, type CalendarEvent } from "@/components/site/activity-calendar";
import { ViewTabs } from "@/components/site/view-tabs";
import { formatTime, lisbonDayKey } from "@/lib/utils";

export const metadata: Metadata = { title: "Atividades" };

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Agenda do grupo"
        description="Vê o que aí vem e inscreve-te. Precisas de uma conta para fazer a inscrição."
      />
      <Container className="py-14">
        <ViewTabs
          calendar={
            <Suspense fallback={<div className="h-[34rem] animate-pulse rounded-3xl bg-surface-2" />}>
              <CalendarSection />
            </Suspense>
          }
          list={
            <>
              <Suspense fallback={null}>
                <InternalActivities />
              </Suspense>
              <PublicActivities />
            </>
          }
        />
      </Container>
    </>
  );
}

/** Calendário: atividades externas e, para quem tem permissão, também as internas. */
async function CalendarSection() {
  const user = await getCurrentUser();
  const withInternal = can(user, "INTERNAL_ACTIVITIES");
  const activities = [
    ...(await getActivities("EXTERNAL")),
    ...(withInternal ? await getActivities("INTERNAL") : []),
  ];
  const now = new Date();
  const events: CalendarEvent[] = activities.map((a) => ({
    id: a.id,
    title: a.title,
    day: lisbonDayKey(a.date),
    time: formatTime(a.date),
    internal: a.visibility === "INTERNAL",
    past: a.date < now,
  }));
  events.sort((x, y) => (x.day + x.time).localeCompare(y.day + y.time));

  return (
    <div className="space-y-3">
      <ActivityCalendar events={events} today={lisbonDayKey(now)} />
      <p className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" /> Abertas a todos
        </span>
        {withInternal && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-internal-fg" /> Internas (só membros)
          </span>
        )}
      </p>
    </div>
  );
}

async function PublicActivities() {
  "use cache";
  cacheLife("minutes");
  const now = new Date();
  const all = await getActivities("EXTERNAL");
  const upcoming = all.filter((a) => a.date >= now);
  const past = all.filter((a) => a.date < now).reverse().slice(0, 6);

  return (
    <>
      <section>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Próximas</h2>
        {upcoming.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((a) => (
              <ActivityCard key={a.id} activity={a} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<CalendarX />} title="Não há atividades marcadas">
            Volta em breve — estamos a preparar novidades.
          </EmptyState>
        )}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-muted">Já aconteceram</h2>
          <div className="grid gap-6 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((a) => (
              <ActivityCard key={a.id} activity={a} now={now} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Atividades internas: só aparecem a quem tem permissão (Staff e acima). */
async function InternalActivities() {
  const user = await getCurrentUser();
  if (!can(user, "INTERNAL_ACTIVITIES")) return null;
  return (
    <Suspense fallback={<GridSkeleton />}>
      <InternalList />
    </Suspense>
  );
}

async function InternalList() {
  "use cache";
  cacheLife("minutes");
  const now = new Date();
  const upcoming = (await getActivities("INTERNAL")).filter((a) => a.date >= now);

  return (
    <section className="rounded-3xl border border-internal-fg/20 bg-internal-soft/50 p-6 sm:p-8">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Lock className="size-5 text-internal-fg" /> Atividades internas
      </h2>
      <p className="mb-6 text-sm text-muted">Só os membros do grupo veem estas atividades.</p>
      {upcoming.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((a) => (
            <ActivityCard key={a.id} activity={a} now={now} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Não há atividades internas marcadas.</p>
      )}
    </section>
  );
}
