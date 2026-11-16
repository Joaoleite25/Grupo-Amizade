"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { destroySession } from "@/lib/session";
import { MASTER_LEVEL } from "@/lib/permissions";
import { ChangePasswordSchema, ProfileSchema, fieldErrors, formValues, type FormState } from "@/lib/validation";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const taken = await db.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: user.id } },
    select: { id: true },
  });
  if (taken) return { values, errors: { email: ["Já existe uma conta com este email."] } };

  await db.user.update({
    where: { id: user.id },
    data: { ...parsed.data, birthDate: new Date(parsed.data.birthDate) },
  });
  revalidatePath("/area", "layout");
  return { ok: true, message: "Perfil atualizado." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = ChangePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { passwordHash } = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(parsed.data.currentPassword, passwordHash))) {
    return { errors: { currentPassword: ["Palavra-passe atual incorreta."] } };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });
  return { ok: true, message: "Palavra-passe alterada." };
}

/** RGPD: o utilizador pode apagar a própria conta e todas as inscrições. */
export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const { passwordHash } = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(String(formData.get("password") ?? ""), passwordHash))) {
    return { errors: { password: ["Palavra-passe incorreta."] } };
  }

  if (user.role.level >= MASTER_LEVEL) {
    const masters = await db.user.count({ where: { role: { level: { gte: MASTER_LEVEL } } } });
    if (masters <= 1) return { message: "És o único Master. Promove outra pessoa antes de apagares a conta." };
  }

  await destroySession();
  await db.user.delete({ where: { id: user.id } });
  redirect("/?conta=apagada");
}
