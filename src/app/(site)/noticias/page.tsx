import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Newspaper } from "lucide-react";
import { getNews } from "@/lib/data";
import { EmptyState } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/site/section";
import { NewsCard } from "@/components/site/news-card";

export const metadata: Metadata = { title: "Notícias" };

export default async function NewsPage() {
  "use cache";
  cacheLife("hours");
  const news = await getNews();

  return (
    <>
      <PageHero eyebrow="Notícias" title="Novidades do grupo" description="Campanhas, parcerias e o que temos feito nas nossas atividades." />
      <Container className="py-14">
        {news.length ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Newspaper />} title="Ainda não há notícias" />
        )}
      </Container>
    </>
  );
}
