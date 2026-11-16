import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { AboutManager } from "@/components/area/about-manager";

export const metadata: Metadata = { title: "Sobre" };

export default async function ManageAboutPage() {
  await requirePermission("MANAGE_ABOUT");
  const sections = await db.aboutSection.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, body: true },
  });
  return (
    <>
      <PageHeader title="Sobre" description="Textos de apresentação do grupo. O primeiro aparece na página principal." />
      <AboutManager sections={sections} />
    </>
  );
}
