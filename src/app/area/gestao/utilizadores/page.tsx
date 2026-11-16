import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { MASTER_LEVEL } from "@/lib/permissions";
import { PageHeader } from "@/components/area/page-header";
import { UsersTable } from "@/components/area/users-table";

export const metadata: Metadata = { title: "Utilizadores" };

export default async function ManageUsersPage() {
  const me = await requirePermission("MANAGE_USERS");
  const [users, roles] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        role: { select: { id: true, name: true, level: true } },
      },
    }),
    db.role.findMany({ orderBy: { level: "asc" }, select: { id: true, name: true, level: true } }),
  ]);

  return (
    <>
      <PageHeader title="Utilizadores" description="Altera o nível dos utilizadores abaixo do teu." />
      <UsersTable
        users={users}
        roles={roles}
        me={{ id: me.id, level: me.role.level, isMaster: me.role.level >= MASTER_LEVEL }}
      />
    </>
  );
}
