import Link from "next/link";
import { excerpt, formatDate } from "@/lib/utils";

type NewsLike = { id: string; title: string; body: string; imageDesktop: string; createdAt: Date };

export function NewsCard({ news }: { news: NewsLike }) {
  return (
    <Link href={`/noticias/${news.id}`} className="group flex flex-col gap-4">
      <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={news.imageDesktop}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div>
        <time dateTime={news.createdAt.toISOString()} className="text-xs font-medium text-muted">
          {formatDate(news.createdAt)}
        </time>
        <h3 className="mt-1.5 text-lg leading-snug font-semibold tracking-tight text-balance group-hover:text-accent">
          {news.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{excerpt(news.body, 180)}</p>
      </div>
    </Link>
  );
}
