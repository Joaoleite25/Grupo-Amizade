import { getActivity } from "@/lib/data";
import { can, getCurrentUser } from "@/lib/auth";
import { activityIcs, fileSlug } from "@/lib/calendar";

/** Ficheiro .ics da atividade, para adicionar ao Apple Calendar, Outlook, etc. */
export async function GET(_req: Request, ctx: RouteContext<"/atividades/[id]/calendario">) {
  const { id } = await ctx.params;
  const activity = await getActivity(id);
  // Atividades internas não existem para quem não tem permissão (igual à página).
  if (!activity || (activity.visibility === "INTERNAL" && !can(await getCurrentUser(), "INTERNAL_ACTIVITIES"))) {
    return new Response("Atividade não encontrada", { status: 404 });
  }

  const name = fileSlug(activity.title);
  return new Response(activityIcs(activity), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name || "atividade"}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
