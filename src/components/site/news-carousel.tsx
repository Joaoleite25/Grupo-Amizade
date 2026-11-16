"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Slide = {
  id: string;
  title: string;
  excerpt: string;
  imageDesktop: string;
  imageMobile: string | null;
  date: string;
};

/** Carrossel das notícias mais recentes (imagem diferente em computador e telemóvel). */
export function NewsCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Notícias em destaque"
      className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <article
            key={s.id}
            aria-roledescription="diapositivo"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== index}
            className="relative aspect-[4/5] w-full shrink-0 sm:aspect-[4/3]"
          >
            <picture>
              {s.imageMobile && <source media="(max-width: 640px)" srcSet={s.imageMobile} />}
              <img
                src={s.imageDesktop}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 size-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs font-medium tracking-wider text-white/70 uppercase">{s.date}</p>
              <h3 className="mt-2 text-xl leading-snug font-semibold tracking-tight text-balance sm:text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 line-clamp-2 max-w-lg text-sm text-white/80">{s.excerpt}</p>
              <Link
                href={`/noticias/${s.id}`}
                tabIndex={i === index ? 0 : -1}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
              >
                Ler notícia <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {count > 1 && (
        <>
          <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Notícia anterior"
              className="grid size-9 place-items-center rounded-full bg-white/90 text-stone-900 shadow backdrop-blur hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Notícia seguinte"
              className="grid size-9 place-items-center rounded-full bg-white/90 text-stone-900 shadow backdrop-blur hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="absolute top-5 left-6 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para a notícia ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full bg-white/50 transition-all hover:bg-white/80",
                  i === index ? "w-6 bg-white" : "w-1.5",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
