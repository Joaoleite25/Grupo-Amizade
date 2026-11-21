import type { MetadataRoute } from "next";
import { getActivities, getNews } from "@/lib/data";
import { siteUrl } from "@/lib/calendar";

/** Mapa do site para o Google: páginas públicas, atividades externas e notícias. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [activities, news] = await Promise.all([getActivities("EXTERNAL"), getNews()]);

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/atividades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/noticias`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/como-participar`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...pages,
    ...activities.map((a) => ({
      url: `${base}/atividades/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: `${base}/noticias/${n.id}`,
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
