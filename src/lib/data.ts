import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Visibility } from "@/generated/prisma/enums";

// Leituras públicas com cache. Quando a direção altera conteúdo, as server
// actions chamam updateTag(<tag>) e a próxima visita já vê a alteração.

export const TAGS = {
  news: "news",
  about: "about",
  footer: "footer",
  activities: "activities",
} as const;

export async function getNews({ onlyPublished = true, limit }: { onlyPublished?: boolean; limit?: number } = {}) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.news);
  return db.news.findMany({
    where: onlyPublished ? { published: true } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewsItem(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.news);
  return db.news.findFirst({ where: { id, published: true } });
}

export async function getAbout() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.about);
  return db.aboutSection.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
}

export async function getFooter() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.footer);
  return db.footerItem.findMany({ orderBy: [{ position: "asc" }, { title: "asc" }] });
}

export type ActivityWithCount = Awaited<ReturnType<typeof getActivities>>[number];

/** Atividades com o número de pessoas já inscritas. */
export async function getActivities(visibility: Visibility = "EXTERNAL") {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.activities);
  const activities = await db.activity.findMany({
    where: { visibility },
    orderBy: { date: "asc" },
  });
  const totals = await db.registration.groupBy({
    by: ["activityId"],
    _sum: { participants: true },
    where: { activityId: { in: activities.map((a) => a.id) } },
  });
  const byId = new Map(totals.map((t) => [t.activityId, t._sum.participants ?? 0]));
  return activities.map((a) => ({ ...a, registered: byId.get(a.id) ?? 0 }));
}

export async function getActivity(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.activities);
  const activity = await db.activity.findUnique({ where: { id } });
  if (!activity) return null;
  const sum = await db.registration.aggregate({
    _sum: { participants: true },
    where: { activityId: id },
  });
  return { ...activity, registered: sum._sum.participants ?? 0 };
}

export type RegistrationStatus = "soon" | "open" | "closed" | "full" | "past";

/** Estado das inscrições de uma atividade num dado momento. */
export function registrationStatus(
  a: { date: Date; registrationOpens: Date; registrationEnds: Date; capacity: number | null; registered: number },
  now: Date,
): RegistrationStatus {
  if (a.date < now) return "past";
  if (now < a.registrationOpens) return "soon";
  if (now > a.registrationEnds) return "closed";
  if (a.capacity !== null && a.registered >= a.capacity) return "full";
  return "open";
}
