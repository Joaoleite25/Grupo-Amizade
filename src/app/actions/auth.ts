"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, hashToken, newToken } from "@/lib/session";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  fieldErrors,
  formValues,
  type FormState,
} from "@/lib/validation";
import * as z from "zod";

const PASSWORD_FIELDS = ["password", "confirmPassword", "currentPassword"];

/** Só aceita caminhos internos, para evitar redirecionamentos para outros sites. */
function safeNext(next: FormDataEntryValue | null) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/area";
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, PASSWORD_FIELDS);
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { username, name, email, birthDate, password } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  });
  if (existing) {
    return {
      values,
      errors: {
        username: existing.username === username ? ["Este nome de utilizador já existe."] : undefined,
        email: existing.email === email ? ["Já existe uma conta com este email."] : undefined,
      },
    };
  }

  // Novos registos ficam com o nível mais baixo (Utilizador).
  const baseRole = await db.role.findFirstOrThrow({ orderBy: { level: "asc" } });
  const user = await db.user.create({
    data: {
      username,
      name,
      email,
      birthDate: new Date(birthDate),
      passwordHash: await bcrypt.hash(password, 12),
      roleId: baseRole.id,
    },
  });

  await createSession(user.id);
  redirect("/area");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, PASSWORD_FIELDS);
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { identifier, password } = parsed.data;
  const user = await db.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  // Mesma mensagem para utilizador inexistente e password errada,
  // para não revelar que contas existem.
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) return { values, message: "Utilizador ou palavra-passe incorretos." };

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { errors: { email: ["Email inválido."] } };

  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user) {
    const token = newToken();
    await db.passwordResetToken.create({
      data: { id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const base = process.env.APP_URL ?? "http://localhost:3000";
    const link = `${base}/redefinir-password?token=${token}`;
    await sendEmail({ to: user.email, ...passwordResetEmail(user.name, link) });
  }

  // Resposta igual quer o email exista ou não.
  return { ok: true, message: "Se existir uma conta com esse email, vais receber um link para definir uma nova palavra-passe." };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = ResetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const record = await db.passwordResetToken.findUnique({ where: { id: hashToken(parsed.data.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { message: "Este link já expirou ou já foi usado. Pede um novo." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Termina todas as sessões abertas com a password antiga.
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  await createSession(record.userId);
  redirect("/area?password=alterada");
}
