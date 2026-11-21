import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

// Limite de tentativas com janela fixa, guardado na base de dados
// (funciona na Vercel, onde cada pedido pode correr num servidor diferente).

/** IP de quem fez o pedido (na Vercel vem no cabeçalho x-forwarded-for). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/**
 * Conta mais uma tentativa para `key` e devolve `true` se ainda estiver dentro do limite.
 * O contador recomeça quando a janela acaba.
 */
export async function hit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  // Um único INSERT ... ON CONFLICT: atómico, mesmo com pedidos em simultâneo.
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count"`;

  // De vez em quando, limpa contadores antigos para a tabela não crescer.
  if (Math.random() < 0.02) {
    await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });
  }

  return Number(rows[0]?.count ?? 0) <= limit;
}

/** Esquece as tentativas de `key` (ex.: depois de um login bem-sucedido). */
export async function resetHits(key: string) {
  await db.rateLimit.deleteMany({ where: { key } });
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
