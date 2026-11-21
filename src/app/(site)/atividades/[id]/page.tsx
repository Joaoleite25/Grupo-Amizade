import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  Baby,
  Backpack,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { getActivity, registrationStatus } from "@/lib/data";
import { can, getCurrentUser } from "@/lib/auth";
import { activityUrl, googleCalendarUrl, mapsUrl, siteUrl } from "@/lib/calendar";
import { GUARDIAN_AGE, ageOn, excerpt, formatDateTime, formatDateTimeRange } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Badge, Card, ImageFallback } from "@/components/ui/misc";
import { Container } from "@/components/site/section";
import { CapacityBar, StatusBadge } from "@/components/site/activity-card";
import { RegistrationForm } from "@/components/site/registration-form";

export async function generateMetadata({ params }: PageProps<"/atividades/[id]">): Promise<Metadata> {
  const a = await getActivity((await params).id);
  if (!a || a.visibility === "INTERNAL") return { title: "Atividade" };
  const description = excerpt(a.description, 160);
  return { title: a.title, description, openGraph: { title: a.title, description, type: "website" } };
}

export default function ActivityPage({ params }: PageProps<"/atividades/[id]">) {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/atividades" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Atividades
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <ActivityDetail id={id} />
        ))}
      </Suspense>
    </Container>
  );
}

async function ActivityDetail({ id }: { id: string }) {
  const activity = await getActivity(id);
  if (!activity) notFound();
  // Atividades internas não existem para quem não tem permissão.
  if (activity.visibility === "INTERNAL" && !can(await getCurrentUser(), "INTERNAL_ACTIVITIES")) notFound();

  await connection(); // o estado das inscrições depende da hora atual
  const now = new Date();
  const status = registrationStatus(activity, now);
  const left = activity.capacity !== null ? Math.max(activity.capacity - activity.registered, 0) : null;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <article>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {activity.visibility === "INTERNAL" && (
            <Badge tone="internal">
              <Lock className="size-3" /> Interna
            </Badge>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{activity.title}</h1>
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-border">
          {activity.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activity.image} alt="" className="size-full object-cover" />
          ) : (
            <ImageFallback className="size-full" />
          )}
        </div>
        <div className="mt-8 max-w-2xl text-lg leading-relaxed whitespace-pre-line text-fg/90">{activity.description}</div>
        {(activity.ages || activity.bring) && (
          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            {activity.ages && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Baby className="size-4 text-accent" /> Idade recomendada
                </p>
                <p className="mt-1 font-medium">{activity.ages}</p>
              </div>
            )}
            {activity.bring && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Backpack className="size-4 text-accent" /> O que levar
                </p>
                <p className="mt-1 font-medium whitespace-pre-line">{activity.bring}</p>
              </div>
            )}
          </div>
        )}
        {activity.link && (
          <a href={activity.link} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md", "mt-8")}>
            Mais informação <ExternalLink />
          </a>
        )}
      </article>

      <aside className="lg:pt-16">
        <Card className="sticky top-24 p-6">
          <dl className="space-y-4 text-sm">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <dt className="text-muted">Quando</dt>
                <dd className="font-medium">{formatDateTimeRange(activity.date, activity.endsAt)}</dd>
              </div>
            </div>
            {activity.location && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <dt className="text-muted">Onde</dt>
                  <dd className="font-medium">
                    <a
                      href={mapsUrl(activity.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent"
                    >
                      {activity.location}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <dt className="text-muted">Inscrições</dt>
                <dd className="font-medium">
                  {formatDateTime(activity.registrationOpens)}
                  <span className="text-muted"> até </span>
                  {formatDateTime(activity.registrationEnds)}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <dt className="text-muted">Vagas</dt>
                <dd className="font-medium">
                  {left === null ? "Sem limite" : left === 0 ? "Esgotado" : `${left} de ${activity.capacity} disponíveis`}
                </dd>
                {activity.waiting > 0 && (
                  <dd className="mt-0.5 text-xs text-muted">
                    {activity.waiting} inscriç{activity.waiting === 1 ? "ão" : "ões"} na lista de espera
                  </dd>
                )}
              </div>
            </div>
          </dl>
          {activity.capacity !== null && status !== "past" && (
            <CapacityBar registered={activity.registered} capacity={activity.capacity} className="mt-4" />
          )}
          <div className="mt-6 border-t border-border pt-6">
            <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surface-2" />}>
              <RegistrationPanel activity={activity} status={status} left={left} />
            </Suspense>
          </div>
        </Card>
      </aside>
      {activity.visibility === "EXTERNAL" && <EventJsonLd activity={activity} />}
    </div>
  );
}

/** Dados estruturados (schema.org/Event) para o Google mostrar a atividade nos resultados. */
function EventJsonLd({ activity }: { activity: NonNullable<Awaited<ReturnType<typeof getActivity>>> }) {
  const url = activityUrl(activity.id);
  const image = activity.image ? new URL(activity.image, siteUrl()).toString() : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: excerpt(activity.description, 500),
    startDate: activity.date.toISOString(),
    ...(activity.endsAt ? { endDate: activity.endsAt.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url,
    ...(image ? { image: [image] } : {}),
    ...(activity.location
      ? { location: { "@type": "Place", name: activity.location, address: activity.location } }
      : {}),
    ...(activity.ages ? { typicalAgeRange: activity.ages } : {}),
    organizer: { "@type": "Organization", name: "Grupo Amizade", url: siteUrl() },
    ...(activity.capacity !== null
      ? { maximumAttendeeCapacity: activity.capacity, remainingAttendeeCapacity: Math.max(activity.capacity - activity.registered, 0) }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: 0,
      priceCurrency: "EUR",
      availability:
        activity.capacity !== null && activity.registered >= activity.capacity
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      validFrom: activity.registrationOpens.toISOString(),
    },
  };
  return (
    <script
      type="application/ld+json"
      // `<` escapado para não ser possível fechar o <script> a partir do texto da atividade.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

async function RegistrationPanel({
  activity,
  status,
  left,
}: {
  activity: NonNullable<Awaited<ReturnType<typeof getActivity>>>;
  status: ReturnType<typeof registrationStatus>;
  left: number | null;
}) {
  const activityId = activity.id;
  const user = await getCurrentUser();
  if (!user) {
    if (status !== "open" && status !== "full") return <ClosedMessage status={status} />;
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          {status === "full"
            ? "Já não há vagas, mas podes entrar na lista de espera: se alguém cancelar, a tua inscrição é confirmada automaticamente."
            : "Inicia sessão para te inscreveres nesta atividade."}
        </p>
        <Link href={`/entrar?next=/atividades/${activityId}`} className={buttonClass("primary", "md", "w-full")}>
          {status === "full" ? "Entrar para a lista de espera" : "Entrar para me inscrever"}
        </Link>
        <p className="text-center text-xs text-muted">
          Ainda não tens conta?{" "}
          <Link href="/registar" className="font-medium text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    );
  }

  const registration = await db.registration.findUnique({
    where: { userId_activityId: { userId: user.id, activityId } },
  });

  const position = registration?.waitlisted
    ? await db.registration.count({
        where: { activityId, waitlisted: true, createdAt: { lte: registration.createdAt } },
      })
    : null;
  const calendar =
    registration && !registration.waitlisted && status !== "past" ? <CalendarLinks activity={activity} /> : null;

  // Enquanto as inscrições estiverem abertas pode inscrever-se, alterar ou entrar na lista de espera.
  const canEdit = status === "open" || status === "full";
  if (!canEdit) {
    return (
      <div className="space-y-3">
        {registration && <RegistrationNotice participants={registration.participants} position={position} />}
        <ClosedMessage status={status} />
        {calendar}
      </div>
    );
  }

  // Quem está confirmado só pode aumentar até às vagas livres; na lista de espera pode pedir até 20.
  const max = registration && !registration.waitlisted ? Math.min(20, (left ?? 20) + registration.participants) : 20;
  return (
    <div className="space-y-4">
      <RegistrationForm
        activityId={activityId}
        current={registration?.participants ?? null}
        max={max}
        waitlistPosition={position}
        joinsWaitlist={!registration && (status === "full" || activity.waiting > 0)}
        guardian={
          ageOn(user.birthDate, activity.date) < GUARDIAN_AGE
            ? { name: registration?.guardianName ?? "", phone: registration?.guardianPhone ?? "" }
            : null
        }
      />
      {calendar}
    </div>
  );
}

function RegistrationNotice({ participants, position }: { participants: number; position: number | null }) {
  const people = `${participants} pessoa${participants === 1 ? "" : "s"}`;
  return position !== null ? (
    <p className="rounded-lg bg-warning-soft px-3 py-2.5 text-sm font-medium text-warning-fg">
      Estás na lista de espera (posição {position}, {people}).
    </p>
  ) : (
    <p className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent-soft-fg">Estás inscrito ({people}).</p>
  );
}

function CalendarLinks({ activity }: { activity: NonNullable<Awaited<ReturnType<typeof getActivity>>> }) {
  return (
    <div className="border-t border-border pt-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
        <CalendarPlus className="size-3.5" /> Adicionar ao calendário
      </p>
      <div className="grid grid-cols-2 gap-2">
        <a href={googleCalendarUrl(activity)} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>
          Google
        </a>
        <a href={`/atividades/${activity.id}/calendario`} className={buttonClass("secondary", "sm")}>
          Apple / Outlook
        </a>
      </div>
    </div>
  );
}

function ClosedMessage({ status }: { status: ReturnType<typeof registrationStatus> }) {
  const text = {
    soon: "As inscrições ainda não abriram.",
    closed: "As inscrições já fecharam.",
    full: "Já não há vagas disponíveis.",
    past: "Esta atividade já aconteceu.",
    open: "",
  }[status];
  return <p className="text-sm text-muted">{text}</p>;
}

function DetailSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded-full bg-surface-2" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="aspect-[16/9] animate-pulse rounded-3xl bg-surface-2" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-surface-2 lg:mt-16" />
    </div>
  );
}
