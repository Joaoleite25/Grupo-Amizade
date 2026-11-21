import { getActivity } from "@/lib/data";
import { OG_SIZE, ogCard } from "@/lib/og";
import { formatDate } from "@/lib/utils";

export const alt = "Atividade do Grupo Amizade";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Imagem de partilha de uma atividade: título, data e local. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const activity = await getActivity((await params).id);
  // Atividades internas (ou inexistentes) não revelam o título a quem recebe o link.
  if (!activity || activity.visibility === "INTERNAL") {
    return ogCard({ eyebrow: "Atividade", title: "Atividades do Grupo Amizade" });
  }

  const when = formatDate(activity.date, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", year: undefined });
  const full = activity.capacity !== null && activity.registered >= activity.capacity;
  return ogCard({
    eyebrow: full ? "Esgotado · lista de espera" : "Inscrições no site",
    title: activity.title,
    details: [when.charAt(0).toUpperCase() + when.slice(1), ...(activity.location ? [activity.location] : [])],
  });
}
