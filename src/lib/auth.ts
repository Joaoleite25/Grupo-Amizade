import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { ALL_PERMISSIONS, MASTER_LEVEL, type Permission } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  birthDate: Date;
  role: { id: number; name: string; level: number };
  permissions: Permission[];
};

/**
 * Data Access Layer: único sítio onde se lê a sessão.
 * `cache` garante que a base de dados só é consultada uma vez por pedido.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await readSession();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) return null;

  const permissions = user.role.level >= MASTER_LEVEL ? ALL_PERMISSIONS : user.role.permissions;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    role: { id: user.role.id, name: user.role.name, level: user.role.level },
    permissions,
  };
});

export function can(user: CurrentUser | null, permission: Permission) {
  return !!user && user.permissions.includes(permission);
}

/** Para páginas: redireciona para o login se não houver sessão. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

/** Para páginas de gestão: redireciona se o utilizador não tiver a permissão. */
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user, permission)) redirect("/area");
  return user;
}

export class ForbiddenError extends Error {
  constructor() {
    super("Não tens permissão para fazer isto.");
  }
}

/** Para server actions: lança erro em vez de redirecionar. */
export async function assertPermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!can(user, permission)) throw new ForbiddenError();
  return user!;
}
