import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Grupo Amizade: associação juvenil de São João de Ver";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Imagem de partilha por omissão (página inicial e páginas sem imagem própria). */
export default async function Image() {
  return ogCard({
    eyebrow: "Associação juvenil · São João de Ver",
    title: "Crescer juntos, em amizade.",
    details: ["Tempos livres", "Educação para a paz", "Solidariedade"],
  });
}
