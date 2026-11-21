import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/area/page-header";

export const metadata: Metadata = { title: "Inscritos" };

function age(birth: Date, at: Date) {
  let a = at.getFullYear() - birth.getFullYear();
  const m = at.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < birth.getDate())) a--;
  return a;
}

export default async function ActivityRegistrationsPage({ params }: PageProps<"/area/gestao/inscricoes/[id]">) {
  await requirePermission("VIEW_REGISTRATIONS");
  const { id } = await params;
  const activity = await db.activity.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: { select: { name: true, username: true, email: true, birthDate: true } } },
        orderBy: [{ waitlisted: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!activity) notFound();

  const confirmed = activity.registrations.filter((r) => !r.waitlisted);
  const waiting = activity.registrations.filter((r) => r.waitlisted);
  const people = confirmed.reduce((s, r) => s + r.participants, 0);

  return (
    <>
      <Link href="/area/gestao/inscricoes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Inscrições
      </Link>
      <PageHeader
        title={activity.title}
        description={formatDateTime(activity.date)}
        actions={
          activity.registrations.length > 0 && (
            <a href={`/area/gestao/inscricoes/${activity.id}/csv`} className={buttonClass("secondary")}>
              <Download /> Exportar CSV
            </a>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-3xl font-semibold tabular-nums">{people}</p>
          <p className="text-sm text-muted">Pessoas</p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold tabular-nums">{confirmed.length}</p>
          <p className="text-sm text-muted">
            Inscrições{waiting.length > 0 && ` · ${waiting.length} em espera`}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold tabular-nums">
            {activity.capacity === null ? "∞" : Math.max(activity.capacity - people, 0)}
          </p>
          <p className="text-sm text-muted">Vagas livres</p>
        </Card>
      </div>

      {activity.registrations.length === 0 ? (
        <EmptyState icon={<Users />} title="Ainda ninguém se inscreveu" />
      ) : (
        <div className="space-y-10">
          {confirmed.length > 0 && <RegistrationTable rows={confirmed} activityDate={activity.date} />}
          {waiting.length > 0 && (
            <section>
              <h2 className="mb-1 text-sm font-semibold tracking-wider text-muted uppercase">Lista de espera</h2>
              <p className="mb-3 text-sm text-muted">
                Por ordem de chegada. São confirmadas automaticamente (e avisadas por email) quando abrem vagas.
              </p>
              <RegistrationTable rows={waiting} activityDate={activity.date} numbered />
            </section>
          )}
        </div>
      )}
    </>
  );
}

type Row = {
  id: string;
  participants: number;
  createdAt: Date;
  user: { name: string; username: string; email: string; birthDate: Date };
};

function RegistrationTable({ rows, activityDate, numbered }: { rows: Row[]; activityDate: Date; numbered?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b border-border text-left text-xs text-muted">
          <tr>
            {numbered && <th className="w-10 px-4 py-3 font-medium">#</th>}
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Idade</th>
            <th className="px-4 py-3 font-medium">Pessoas</th>
            <th className="px-4 py-3 font-medium">Inscrito em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={r.id}>
              {numbered && <td className="px-4 py-3 text-muted tabular-nums">{i + 1}</td>}
              <td className="px-4 py-3">
                <p className="font-medium">{r.user.name}</p>
                <p className="text-xs text-muted">@{r.user.username}</p>
              </td>
              <td className="px-4 py-3 text-muted">{r.user.email}</td>
              <td className="px-4 py-3 tabular-nums">{age(r.user.birthDate, activityDate)}</td>
              <td className="px-4 py-3">
                <Badge tone={numbered ? "warning" : "accent"}>{r.participants}</Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
