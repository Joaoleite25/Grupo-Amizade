import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Exporta os inscritos de uma atividade em CSV (abre no Excel). */
export async function GET(_req: Request, ctx: RouteContext<"/area/gestao/inscricoes/[id]/csv">) {
  if (!can(await getCurrentUser(), "VIEW_REGISTRATIONS")) return new Response("Sem permissão", { status: 403 });

  const { id } = await ctx.params;
  const activity = await db.activity.findUnique({
    where: { id },
    include: { registrations: { include: { user: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!activity) return new Response("Não encontrada", { status: 404 });

  const rows = [
    ["Nome", "Utilizador", "Email", "Data de nascimento", "Pessoas", "Inscrito em"],
    ...activity.registrations.map((r) => [
      r.user.name,
      r.user.username,
      r.user.email,
      r.user.birthDate.toISOString().slice(0, 10),
      r.participants,
      formatDate(r.createdAt),
    ]),
  ];
  // BOM + ";" para o Excel em português abrir com acentos e colunas certas.
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  const name = activity.title.normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-${name}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
