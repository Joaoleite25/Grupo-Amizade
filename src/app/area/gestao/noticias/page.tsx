import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/area/page-header";
import { NewsManager } from "@/components/area/news-manager";

export const metadata: Metadata = { title: "Notícias" };

export default async function ManageNewsPage() {
  await requirePermission("MANAGE_NEWS");
  const news = await db.news.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Notícias" description="As notícias publicadas aparecem no carrossel da página principal." />
      <NewsManager news={news} />
    </>
  );
}
