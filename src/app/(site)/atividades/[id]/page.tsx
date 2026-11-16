import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, CalendarClock, CalendarDays, ExternalLink, Lock, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getActivity, registrationStatus } from "@/lib/data";
import { can, getCurrentUser } from "@/lib/auth";
import { excerpt, formatDateTime } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Badge, Card, ImageFallback } from "@/components/ui/misc";
import { Container } from "@/components/site/section";
import { StatusBadge } from "@/components/site/activity-card";
import { RegistrationForm } from "@/components/site/registration-form";

export async function generateMetadata({ params }: PageProps<"/atividades/[id]">): Promise<Metadata> {
  const a = await getActivity((await params).id);
  if (!a || a.visibility === "INTERNAL") return { title: "Atividade" };
  return { title: a.title, description: excerpt(a.description, 160) };
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
                <dd className="font-medium">{formatDateTime(activity.date)}</dd>
              </div>
            </div>
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
                  {left === null ? "Sem limite" : `${left} de ${activity.capacity} disponíveis`}
                </dd>
              </div>
            </div>
          </dl>
          {left !== null && activity.capacity! > 0 && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, (activity.registered / activity.capacity!) * 100)}%` }}
              />
            </div>
          )}
          <div className="mt-6 border-t border-border pt-6">
            <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surface-2" />}>
              <RegistrationPanel activityId={activity.id} status={status} left={left} />
            </Suspense>
          </div>
        </Card>
      </aside>
    </div>
  );
}

async function RegistrationPanel({
  activityId,
  status,
  left,
}: {
  activityId: string;
  status: ReturnType<typeof registrationStatus>;
  left: number | null;
}) {
  const user = await getCurrentUser();
  if (!user) {
    if (status !== "open") return <ClosedMessage status={status} />;
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Inicia sessão para te inscreveres nesta atividade.</p>
        <Link href={`/entrar?next=/atividades/${activityId}`} className={buttonClass("primary", "md", "w-full")}>
          Entrar para me inscrever
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

  // Pode alterar a inscrição enquanto as inscrições estiverem abertas (mesmo se esgotado).
  const canEdit = status === "open" || (status === "full" && !!registration);
  if (!canEdit) {
    return (
      <div className="space-y-2">
        {registration && (
          <p className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent-soft-fg">
            Estás inscrito ({registration.participants} pessoa{registration.participants === 1 ? "" : "s"}).
          </p>
        )}
        <ClosedMessage status={status} />
      </div>
    );
  }

  const max = Math.min(20, (left ?? 20) + (registration?.participants ?? 0));
  return <RegistrationForm activityId={activityId} current={registration?.participants ?? null} max={max} />;
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
