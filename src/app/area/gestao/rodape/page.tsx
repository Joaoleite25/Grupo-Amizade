import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { FooterManager } from "@/components/area/footer-manager";

export const metadata: Metadata = { title: "Informações" };

export default async function ManageFooterPage() {
  const user = await requireUser();
  const canEdit = can(user, "EDIT_FOOTER");
  const canCreate = can(user, "CREATE_FOOTER");
  if (!canEdit && !canCreate) redirect("/area");

  const items = await db.footerItem.findMany({ orderBy: [{ position: "asc" }, { title: "asc" }] });
  return (
    <>
      <PageHeader title="Informações" description="Contactos e redes sociais que aparecem no rodapé do site." />
      <FooterManager items={items} canEdit={canEdit} canCreate={canCreate} />
    </>
  );
}
