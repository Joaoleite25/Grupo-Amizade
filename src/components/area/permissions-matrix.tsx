"use client";

import { useActionState, useEffect } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { saveRolePermissions } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/client";
import { FormMessage } from "@/components/ui/misc";
import { MASTER_LEVEL, PERMISSIONS, type Permission } from "@/lib/permissions";

type Role = { id: number; name: string; level: number; permissions: Permission[]; users: number };

/** Matriz níveis × permissões (opção "Sidebar" do relatório original). */
export function PermissionsMatrix({ roles }: { roles: Role[] }) {
  const [state, action] = useActionState(saveRolePermissions, undefined);
  useEffect(() => {
    if (state?.ok) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      {!state?.ok && <FormMessage state={state} />}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted">Permissão</th>
              {roles.map((r) => (
                <th key={r.id} className="px-4 py-3 text-center">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs font-normal text-muted">
                    {r.users} utilizador{r.users === 1 ? "" : "es"}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PERMISSIONS.map((p) => (
              <tr key={p.key} className="hover:bg-surface-2/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.label}</p>
                  <p className="text-xs text-muted">{p.description}</p>
                </td>
                {roles.map((r) => {
                  const locked = r.level >= MASTER_LEVEL || p.key === "MANAGE_ROLES";
                  const checked = r.level >= MASTER_LEVEL || r.permissions.includes(p.key);
                  return (
                    <td key={r.id} className="px-4 py-3 text-center">
                      {locked ? (
                        <span
                          className="inline-grid size-5 place-items-center text-muted"
                          title={r.level >= MASTER_LEVEL ? "O Master tem sempre todas as permissões" : "Só o Master"}
                        >
                          {checked ? <Lock className="size-3.5" /> : "—"}
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          name={`${r.id}:${p.key}`}
                          defaultChecked={checked}
                          aria-label={`${p.label} para ${r.name}`}
                          className="size-4 cursor-pointer accent-[var(--accent)]"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted">O Master tem sempre acesso a tudo, para nunca ficar ninguém sem conseguir gerir o site.</p>
        <SubmitButton pendingText="A guardar...">Guardar permissões</SubmitButton>
      </div>
    </form>
  );
}
