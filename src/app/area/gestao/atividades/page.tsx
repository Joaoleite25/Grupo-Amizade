import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { toLisbonInputValue } from "@/lib/utils";
import { PageHeader } from "@/components/area/page-header";
import { ActivitiesManager, type ActivityRow } from "@/components/area/activities-manager";

export const metadata: Metadata = { title: "Atividades" };

async function loadActivities() {
  await connection();
  const activities = await db.activity.findMany({ orderBy: { date: "asc" } });
  const totals = await db.registration.groupBy({ by: ["activityId"], _sum: { participants: true } });
  const byId = new Map(totals.map((t) => [t.activityId, t._sum.participants ?? 0]));

  const rows: ActivityRow[] = activities.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    image: a.image,
    date: a.date,
    capacity: a.capacity,
    visibility: a.visibility,
    link: a.link,
    registered: byId.get(a.id) ?? 0,
    inputs: {
      date: toLisbonInputValue(a.date),
      registrationOpens: toLisbonInputValue(a.registrationOpens),
      registrationEnds: toLisbonInputValue(a.registrationEnds),
    },
  }));

  return { rows, nowMs: Date.now() };
}

export default async function ManageActivitiesPage() {
  await requirePermission("MANAGE_ACTIVITIES");
  const { rows, nowMs } = await loadActivities();

  return (
    <>
      <PageHeader title="Atividades" description="Cria atividades internas (só membros) ou externas (abertas a todos)." />
      <ActivitiesManager activities={rows} nowMs={nowMs} />
    </>
  );
}
