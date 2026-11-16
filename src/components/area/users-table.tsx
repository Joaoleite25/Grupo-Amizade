"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { changeUserRole } from "@/app/actions/admin";
import { Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/client";
import { Badge, EmptyState } from "@/components/ui/misc";
import { formatDate, initials } from "@/lib/utils";

type Role = { id: number; name: string; level: number };
type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
  role: Role;
};

function RoleForm({ user, assignable, editable }: { user: UserRow; assignable: Role[]; editable: boolean }) {
  const [state, action] = useActionState(changeUserRole, undefined);
  const [roleId, setRoleId] = useState(String(user.role.id));

  useEffect(() => {
    if (!state?.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  if (!editable) return <Badge>{user.role.name}</Badge>;

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <Select
        name="roleId"
        value={roleId}
        onChange={(e) => setRoleId(e.target.value)}
        aria-label={`Nível de ${user.name}`}
        className="h-9 w-36"
      >
        {assignable.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      {roleId !== String(user.role.id) && (
        <SubmitButton size="sm" pendingText="...">
          Guardar
        </SubmitButton>
      )}
    </form>
  );
}

export function UsersTable({
  users,
  roles,
  me,
}: {
  users: UserRow[];
  roles: Role[];
  me: { id: string; level: number; isMaster: boolean };
}) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter(
      (u) =>
        (roleFilter === "all" || String(u.role.id) === roleFilter) &&
        (!t || u.name.toLowerCase().includes(t) || u.username.includes(t) || u.email.includes(t)),
    );
  }, [q, roleFilter, users]);

  // Regras iguais às do servidor (o servidor volta a verificar tudo).
  const assignable = me.isMaster ? roles : roles.filter((r) => r.level < me.level);
  const canEdit = (u: UserRow) => u.id !== me.id && (me.isMaster || u.role.level < me.level);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por nome, utilizador ou email..."
            aria-label="Pesquisar utilizadores"
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filtrar por nível" className="sm:w-44">
          <option value="all">Todos os níveis</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users />} title="Nenhum utilizador encontrado" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Utilizador</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Registo</th>
                <th className="px-4 py-3 font-medium">Nível</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-semibold text-muted">
                        {initials(u.name)}
                      </span>
                      <div>
                        <p className="font-medium">
                          {u.name} {u.id === me.id && <span className="text-xs text-muted">(tu)</span>}
                        </p>
                        <p className="text-xs text-muted">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(u.createdAt, { month: "short" })}</td>
                  <td className="px-4 py-3">
                    <RoleForm user={u} assignable={assignable} editable={canEdit(u)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted">{filtered.length} de {users.length} utilizadores</p>
    </div>
  );
}
