import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { registrationConfirmedEmail, sendEmailSafely } from "@/lib/email";

type Tx = Prisma.TransactionClient;

/** Bloqueia a linha da atividade até ao fim da transação (SELECT ... FOR UPDATE). */
export async function lockActivity(tx: Tx, activityId: string) {
  await tx.$executeRaw`SELECT id FROM "Activity" WHERE id = ${activityId} FOR UPDATE`;
}

/** Pessoas com inscrição confirmada (sem contar a lista de espera). */
export async function confirmedPeople(tx: Tx, activityId: string, exceptUserId?: string) {
  const sum = await tx.registration.aggregate({
    _sum: { participants: true },
    where: { activityId, waitlisted: false, ...(exceptUserId ? { NOT: { userId: exceptUserId } } : {}) },
  });
  return sum._sum.participants ?? 0;
}

export async function waitlistPosition(tx: Tx, registration: { activityId: string; createdAt: Date }) {
  return tx.registration.count({
    where: { activityId: registration.activityId, waitlisted: true, createdAt: { lte: registration.createdAt } },
  });
}

export type Promoted = Awaited<ReturnType<typeof promoteWaitlist>>[number];

/**
 * Confirma inscrições da lista de espera enquanto houver vagas, por ordem de chegada.
 * Se a primeira da fila não couber (ex.: pediu 4 lugares e só há 2), pára aí:
 * ninguém passa à frente de quem chegou primeiro.
 * Tem de correr dentro de uma transação que já bloqueou a atividade.
 */
export async function promoteWaitlist(tx: Tx, activityId: string) {
  const activity = await tx.activity.findUnique({ where: { id: activityId } });
  if (!activity || activity.date < new Date()) return [];

  let free = activity.capacity === null ? Infinity : activity.capacity - (await confirmedPeople(tx, activityId));
  const queue = await tx.registration.findMany({
    where: { activityId, waitlisted: true },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const promoted = [];
  for (const r of queue) {
    if (r.participants > free) break;
    await tx.registration.update({ where: { id: r.id }, data: { waitlisted: false } });
    free -= r.participants;
    promoted.push({ ...r, activity });
  }
  return promoted;
}

/** Avisa por email quem saiu da lista de espera. Chamar depois da transação terminar. */
export async function notifyPromoted(promoted: Promoted[]) {
  await Promise.all(
    promoted.map((r) =>
      sendEmailSafely({ to: r.user.email, ...registrationConfirmedEmail(r.user.name, r.activity, r.participants, true) }),
    ),
  );
}
