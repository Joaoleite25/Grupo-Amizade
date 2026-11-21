import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { AboutManager } from "@/components/area/about-manager";
import { HeroImageForm } from "@/components/area/hero-image-form";
import { SETTINGS } from "@/lib/data";

export const metadata: Metadata = { title: "Sobre" };

export default async function ManageAboutPage() {
  await requirePermission("MANAGE_ABOUT");
  const [sections, settings] = await Promise.all([
    db.aboutSection.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, body: true },
    }),
    db.setting.findMany({ where: { key: { in: [SETTINGS.heroImage, SETTINGS.heroAlt] } } }),
  ]);
  const setting = (key: string) => settings.find((s) => s.key === key)?.value ?? null;
  return (
    <>
      <PageHeader title="Sobre" description="Foto do topo e textos de apresentação do grupo. O primeiro texto aparece na página principal." />
      <HeroImageForm image={setting(SETTINGS.heroImage)} alt={setting(SETTINGS.heroAlt) ?? ""} />
      <AboutManager sections={sections} />
    </>
  );
}
