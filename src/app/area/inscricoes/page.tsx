import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Ticket, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { cancelRegistration } from "@/app/actions/registrations";
import { buttonClass } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ConfirmSubmit } from "@/components/ui/client";
import { PageHeader } from "@/components/area/page-header";

export const metadata: Metadata = { title: "Minhas inscrições" };

export default async function MyRegistrationsPage() {
  const user = await requireUser();
  const now = new Date();
  const registrations = await db.registration.findMany({
    where: { userId: user.id },
    include: { activity: true },
    orderBy: { activity: { date: "desc" } },
  });

  const upcoming = registrations.filter((r) => r.activity.date >= now).reverse();
  const past = registrations.filter((r) => r.activity.date < now);

  return (
    <>
      <PageHeader title="Minhas inscrições" description="Altera o número de pessoas ou cancela as tuas inscrições." />

      {registrations.length === 0 ? (
        <EmptyState icon={<Ticket />} title="Ainda não tens inscrições">
          <Link href="/atividades" className={buttonClass("primary", "sm", "mt-4")}>
            Ver atividades
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-10">
          <RegistrationList title="Próximas" items={upcoming} editable />
          {past.length > 0 && <RegistrationList title="Histórico" items={past} />}
        </div>
      )}
    </>
  );
}

type Item = Awaited<ReturnType<typeof db.registration.findMany<{ include: { activity: true } }>>>[number];

function RegistrationList({ title, items, editable }: { title: string; items: Item[]; editable?: boolean }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-wider text-muted uppercase">{title}</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/atividades/${r.activityId}`} className="font-semibold hover:text-accent">
                  {r.activity.title}
                </Link>
                {r.activity.visibility === "INTERNAL" && <Badge tone="internal">Interna</Badge>}
              </div>
              <p className="mt-0.5 text-sm text-muted">{formatDateTime(r.activity.date)}</p>
            </div>
            {r.waitlisted && (
              <Badge tone="warning" className="self-start sm:self-center">
                Lista de espera
              </Badge>
            )}
            <Badge tone={editable && !r.waitlisted ? "accent" : "neutral"} className="self-start sm:self-center">
              {r.participants} pessoa{r.participants === 1 ? "" : "s"}
            </Badge>
            {editable && (
              <div className="flex gap-1">
                <Link href={`/atividades/${r.activityId}`} className={buttonClass("ghost", "sm")}>
                  <Pencil /> Alterar
                </Link>
                <form action={cancelRegistration}>
                  <input type="hidden" name="activityId" value={r.activityId} />
                  <ConfirmSubmit message={`Cancelar a inscrição em "${r.activity.title}"?`}>
                    <X /> Cancelar
                  </ConfirmSubmit>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
