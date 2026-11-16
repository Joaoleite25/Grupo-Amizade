import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getNewsItem } from "@/lib/data";
import { excerpt, formatDate } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/site/section";

export async function generateMetadata({ params }: PageProps<"/noticias/[id]">): Promise<Metadata> {
  const news = await getNewsItem((await params).id);
  if (!news) return {};
  return {
    title: news.title,
    description: excerpt(news.body, 160),
    openGraph: { images: [news.imageDesktop] },
  };
}

export default function NewsDetailPage({ params }: PageProps<"/noticias/[id]">) {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <Link href="/noticias" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Notícias
      </Link>
      <Suspense fallback={<ArticleSkeleton />}>
        {params.then(({ id }) => (
          <Article id={id} />
        ))}
      </Suspense>
    </Container>
  );
}

async function Article({ id }: { id: string }) {
  const news = await getNewsItem(id);
  if (!news) notFound();

  return (
    <article className="mt-8">
      <time dateTime={news.createdAt.toISOString()} className="text-sm font-medium text-accent">
        {formatDate(news.createdAt)}
      </time>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{news.title}</h1>
      <div className="mt-8 overflow-hidden rounded-3xl border border-border">
        <picture>
          {news.imageMobile && <source media="(max-width: 640px)" srcSet={news.imageMobile} />}
          <img src={news.imageDesktop} alt="" className="w-full object-cover" />
        </picture>
      </div>
      <div className="mt-8 text-lg leading-relaxed whitespace-pre-line text-fg/90">{news.body}</div>
      {news.link && (
        <a href={news.link} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md", "mt-8")}>
          Saber mais <ExternalLink />
        </a>
      )}
    </article>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="h-12 w-4/5 animate-pulse rounded bg-surface-2" />
      <div className="mt-8 aspect-[16/9] animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}
