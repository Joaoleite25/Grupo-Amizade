import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { PermissionsMatrix } from "@/components/area/permissions-matrix";

export const metadata: Metadata = { title: "Permissões" };

export default async function PermissionsPage() {
  await requirePermission("MANAGE_ROLES");
  const roles = await db.role.findMany({
    orderBy: { level: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <>
      <PageHeader
        title="Permissões"
        description="Define o que cada nível pode fazer. As opções da barra lateral de cada pessoa mudam conforme estas permissões."
      />
      <PermissionsMatrix
        roles={roles.map((r) => ({ id: r.id, name: r.name, level: r.level, permissions: r.permissions, users: r._count.users }))}
      />
    </>
  );
}
