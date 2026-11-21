"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { TAGS, registrationStatus } from "@/lib/data";
import { registrationConfirmedEmail, sendEmailSafely, waitlistEmail } from "@/lib/email";
import { confirmedPeople, lockActivity, notifyPromoted, promoteWaitlist, waitlistPosition, type Promoted } from "@/lib/waitlist";
import { ParticipantsSchema, type FormState } from "@/lib/validation";

class RegistrationError extends Error {}

type Outcome =
  | { kind: "confirmed" } // nova inscrição confirmada
  | { kind: "waitlisted"; position: number } // nova inscrição em lista de espera
  | { kind: "updated" } // alterou uma inscrição confirmada
  | { kind: "waitlist-updated"; position: number }; // alterou uma inscrição em espera

/**
 * Cria ou altera a inscrição do utilizador numa atividade.
 * Corre numa transação com bloqueio da atividade (SELECT ... FOR UPDATE)
 * para que duas inscrições ao mesmo tempo não ultrapassem o limite.
 * Se não houver vagas, a inscrição nova fica em lista de espera.
 */
export async function saveRegistration(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Tens de iniciar sessão para te inscreveres." };

  const activityId = String(formData.get("activityId") ?? "");
  const participants = ParticipantsSchema.safeParse(formData.get("participants") ?? "1");
  if (!participants.success) return { errors: { participants: [participants.error.issues[0]!.message] } };
  const n = participants.data;

  let outcome: Outcome;
  let promoted: Promoted[] = [];
  let activity;
  try {
    ({ outcome, promoted, activity } = await db.$transaction(async (tx) => {
      await lockActivity(tx, activityId);
      const activity = await tx.activity.findUnique({ where: { id: activityId } });
      if (!activity) throw new RegistrationError("Atividade não encontrada.");
      if (activity.visibility === "INTERNAL" && !can(user, "INTERNAL_ACTIVITIES")) {
        throw new RegistrationError("Esta atividade é só para membros do grupo.");
      }

      const status = registrationStatus({ ...activity, registered: 0 }, new Date());
      if (status === "soon") throw new RegistrationError("As inscrições ainda não abriram.");
      if (status === "closed" || status === "past") throw new RegistrationError("As inscrições já fecharam.");

      const existing = await tx.registration.findUnique({
        where: { userId_activityId: { userId: user.id, activityId } },
      });
      const others = await confirmedPeople(tx, activityId, user.id);
      const fits = activity.capacity === null || others + n <= activity.capacity;

      // 1) Já tem inscrição confirmada: só muda o número de pessoas, se couber.
      if (existing && !existing.waitlisted) {
        if (!fits) {
          const left = Math.max(activity.capacity! - others, 0);
          throw new RegistrationError(
            `Só há lugar para ${left} pessoa${left === 1 ? "" : "s"} nesta inscrição. Para mais, cancela e volta a inscrever-te na lista de espera.`,
          );
        }
        await tx.registration.update({ where: { id: existing.id }, data: { participants: n } });
        // Se reduziu o número de pessoas, pode haver vagas para a lista de espera.
        const promoted = n < existing.participants ? await promoteWaitlist(tx, activityId) : [];
        return { outcome: { kind: "updated" } as Outcome, promoted, activity };
      }

      // 2) Está em lista de espera: atualiza o pedido e vê se já cabe.
      if (existing) {
        await tx.registration.update({ where: { id: existing.id }, data: { participants: n } });
        const promoted = await promoteWaitlist(tx, activityId);
        if (promoted.some((p) => p.id === existing.id)) {
          return { outcome: { kind: "confirmed" } as Outcome, promoted: promoted.filter((p) => p.id !== existing.id), activity };
        }
        const position = await waitlistPosition(tx, existing);
        return { outcome: { kind: "waitlist-updated", position } as Outcome, promoted, activity };
      }

      // 3) Inscrição nova. Se já há fila, entra na fila: ninguém passa à frente.
      const queue = await tx.registration.count({ where: { activityId, waitlisted: true } });
      if (fits && queue === 0) {
        await tx.registration.create({ data: { userId: user.id, activityId, participants: n } });
        return { outcome: { kind: "confirmed" } as Outcome, promoted: [], activity };
      }
      const created = await tx.registration.create({
        data: { userId: user.id, activityId, participants: n, waitlisted: true },
      });
      const position = await waitlistPosition(tx, created);
      return { outcome: { kind: "waitlisted", position } as Outcome, promoted: [], activity };
    }));
  } catch (e) {
    if (e instanceof RegistrationError) return { message: e.message };
    throw e;
  }

  // Emails depois de responder, para a página não ficar à espera do envio.
  after(async () => {
    if (outcome.kind === "confirmed") {
      await sendEmailSafely({ to: user.email, ...registrationConfirmedEmail(user.name, activity, n) });
    } else if (outcome.kind === "waitlisted") {
      await sendEmailSafely({ to: user.email, ...waitlistEmail(user.name, activity, n, outcome.position) });
    }
    await notifyPromoted(promoted);
  });

  updateTag(TAGS.activities);
  revalidatePath("/area", "layout");

  const message = {
    confirmed: "Inscrição confirmada! Enviámos-te um email com os detalhes.",
    waitlisted: `Não há vagas suficientes: ficaste na lista de espera (posição ${"position" in outcome ? outcome.position : ""}). Avisamos-te por email se abrir uma vaga.`,
    updated: "Inscrição atualizada.",
    "waitlist-updated": `Pedido atualizado. Continuas na lista de espera (posição ${"position" in outcome ? outcome.position : ""}).`,
  }[outcome.kind];
  return { ok: true, message };
}

export async function cancelRegistration(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const activityId = String(formData.get("activityId") ?? "");

  const promoted = await db.$transaction(async (tx) => {
    await lockActivity(tx, activityId);
    const activity = await tx.activity.findUnique({ where: { id: activityId }, select: { date: true } });
    // Não faz sentido cancelar depois de a atividade acontecer (fica no histórico).
    if (!activity || activity.date < new Date()) return [];

    const removed = await tx.registration.deleteMany({ where: { userId: user.id, activityId } });
    // Libertou lugares: confirma quem está na lista de espera.
    return removed.count > 0 ? promoteWaitlist(tx, activityId) : [];
  });

  if (promoted.length) after(() => notifyPromoted(promoted));
  updateTag(TAGS.activities);
  revalidatePath("/area", "layout");
}
