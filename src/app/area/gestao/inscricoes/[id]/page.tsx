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
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!activity) notFound();

  const people = activity.registrations.reduce((s, r) => s + r.participants, 0);

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
          <p className="text-3xl font-semibold tabular-nums">{activity.registrations.length}</p>
          <p className="text-sm text-muted">Inscrições</p>
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
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Idade</th>
                <th className="px-4 py-3 font-medium">Pessoas</th>
                <th className="px-4 py-3 font-medium">Inscrito em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activity.registrations.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.user.name}</p>
                    <p className="text-xs text-muted">@{r.user.username}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.user.email}</td>
                  <td className="px-4 py-3 tabular-nums">{age(r.user.birthDate, activity.date)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="accent">{r.participants}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
