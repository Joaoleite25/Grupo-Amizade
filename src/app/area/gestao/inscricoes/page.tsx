import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { RegistrationsOverview } from "@/components/area/registrations-overview";

export const metadata: Metadata = { title: "Inscrições" };

export default async function ManageRegistrationsPage() {
  await requirePermission("VIEW_REGISTRATIONS");
  await connection();
  const now = new Date();
  const activities = await db.activity.findMany({ orderBy: { date: "desc" } });
  const totals = await db.registration.groupBy({
    by: ["activityId"],
    _sum: { participants: true },
    _count: { _all: true },
    where: { waitlisted: false },
  });
  const byId = new Map(totals.map((t) => [t.activityId, t]));

  const rows = activities
    .map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      visibility: a.visibility,
      capacity: a.capacity,
      people: byId.get(a.id)?._sum.participants ?? 0,
      registrations: byId.get(a.id)?._count._all ?? 0,
      past: a.date < now,
    }))
    // Próximas primeiro (da mais próxima para a mais distante), depois as passadas.
    .sort((x, y) => Number(x.past) - Number(y.past) || (x.past ? y.date.getTime() - x.date.getTime() : x.date.getTime() - y.date.getTime()));

  return (
    <>
      <PageHeader title="Inscrições" description="Pesquisa uma atividade para veres quem está inscrito e quantas pessoas." />
      <RegistrationsOverview rows={rows} />
    </>
  );
}
