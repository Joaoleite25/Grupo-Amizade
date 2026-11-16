"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { TAGS, registrationStatus } from "@/lib/data";
import { ParticipantsSchema, type FormState } from "@/lib/validation";

class RegistrationError extends Error {}

/**
 * Cria ou altera a inscrição do utilizador numa atividade.
 * Corre numa transação com bloqueio da atividade (SELECT ... FOR UPDATE)
 * para que duas inscrições ao mesmo tempo não ultrapassem o limite.
 */
export async function saveRegistration(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Tens de iniciar sessão para te inscreveres." };

  const activityId = String(formData.get("activityId") ?? "");
  const participants = ParticipantsSchema.safeParse(formData.get("participants") ?? "1");
  if (!participants.success) return { errors: { participants: [participants.error.issues[0]!.message] } };

  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Activity" WHERE id = ${activityId} FOR UPDATE`;
      const activity = await tx.activity.findUnique({ where: { id: activityId } });
      if (!activity) throw new RegistrationError("Atividade não encontrada.");
      if (activity.visibility === "INTERNAL" && !can(user, "INTERNAL_ACTIVITIES")) {
        throw new RegistrationError("Esta atividade é só para membros do grupo.");
      }

      const others = await tx.registration.aggregate({
        _sum: { participants: true },
        where: { activityId, NOT: { userId: user.id } },
      });
      const registered = others._sum.participants ?? 0;

      const status = registrationStatus({ ...activity, registered: 0 }, new Date());
      if (status === "soon") throw new RegistrationError("As inscrições ainda não abriram.");
      if (status === "closed" || status === "past") throw new RegistrationError("As inscrições já fecharam.");

      if (activity.capacity !== null && registered + participants.data > activity.capacity) {
        const left = Math.max(activity.capacity - registered, 0);
        throw new RegistrationError(
          left === 0 ? "Já não há vagas para esta atividade." : `Só restam ${left} vaga${left === 1 ? "" : "s"}.`,
        );
      }

      await tx.registration.upsert({
        where: { userId_activityId: { userId: user.id, activityId } },
        create: { userId: user.id, activityId, participants: participants.data },
        update: { participants: participants.data },
      });
    });
  } catch (e) {
    if (e instanceof RegistrationError) return { message: e.message };
    throw e;
  }

  updateTag(TAGS.activities);
  revalidatePath("/area", "layout");
  return { ok: true, message: "Inscrição guardada." };
}

export async function cancelRegistration(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const activityId = String(formData.get("activityId") ?? "");
  const activity = await db.activity.findUnique({ where: { id: activityId }, select: { date: true } });
  // Não faz sentido cancelar depois de a atividade acontecer (fica no histórico).
  if (!activity || activity.date < new Date()) return;

  await db.registration.deleteMany({ where: { userId: user.id, activityId } });
  updateTag(TAGS.activities);
  revalidatePath("/area", "layout");
}
