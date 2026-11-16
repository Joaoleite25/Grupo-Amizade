import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

const COOKIE = "ga_session";
const SESSION_DAYS = 30;

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Cria a sessão na base de dados e guarda o token num cookie httpOnly. */
export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Devolve o id do utilizador da sessão atual, ou null. */
export async function readSession() {
  await connection(); // a validade da sessão depende da hora atual
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({ where: { id: hashToken(token) } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.userId;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(COOKIE);
}
