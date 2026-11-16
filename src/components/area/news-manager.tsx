"use client";

import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteNews, saveNews } from "@/app/actions/admin";
import { EntityDialog } from "@/components/area/entity-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/client";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

type News = {
  id: string;
  title: string;
  body: string;
  imageDesktop: string;
  imageMobile: string | null;
  link: string | null;
  published: boolean;
  createdAt: Date;
};

function NewsFields({ state, news }: { state: FormState; news?: News }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  return (
    <>
      {news && <input type="hidden" name="id" value={news.id} />}
      <Field label="Título" name="title" errors={e.title}>
        <Input id="title" name="title" defaultValue={v?.title ?? news?.title} required />
      </Field>
      <Field label="Notícia" name="body" errors={e.body}>
        <Textarea id="body" name="body" rows={6} defaultValue={v?.body ?? news?.body} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Foto — computador"
          name="imageDesktop"
          errors={e.imageDesktop}
          hint={news ? "Deixa vazio para manter a atual." : "Horizontal, ex.: 1600×1000."}
        >
          <Input id="imageDesktop" name="imageDesktop" type="file" accept="image/*" className="py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs" required={!news} />
        </Field>
        <Field label="Foto — telemóvel" name="imageMobile" errors={e.imageMobile} hint="Opcional. Vertical, ex.: 900×1200.">
          <Input id="imageMobile" name="imageMobile" type="file" accept="image/*" className="py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs" />
        </Field>
      </div>
      <Field label="Ligação" name="link" errors={e.link} hint="Opcional — ex.: publicação no Facebook.">
        <Input id="link" name="link" type="url" placeholder="https://" defaultValue={v?.link ?? news?.link ?? ""} />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={v ? v.published === "on" : (news?.published ?? true)}
          className="size-4 accent-[var(--accent)]"
        />
        Publicada (aparece no site)
      </label>
    </>
  );
}

export function NewsManager({ news }: { news: News[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <EntityDialog
          title="Nova notícia"
          action={saveNews}
          submitLabel="Criar"
          wide
          trigger={(open) => (
            <Button onClick={open}>
              <Plus /> Nova notícia
            </Button>
          )}
        >
          {(state) => <NewsFields state={state} />}
        </EntityDialog>
      </div>

      {news.length === 0 ? (
        <EmptyState icon={<Newspaper />} title="Ainda não há notícias">
          As notícias aparecem no carrossel da página principal.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {news.map((n) => (
            <li key={n.id} className="flex items-center gap-4 p-3 pr-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.imageDesktop} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover sm:h-16 sm:w-28" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{n.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {formatDate(n.createdAt)}
                  {!n.published && <Badge tone="warning">Rascunho</Badge>}
                  {n.imageMobile && <Badge>Foto telemóvel</Badge>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <EntityDialog
                  title="Editar notícia"
                  action={saveNews}
                  wide
                  trigger={(open) => (
                    <Button variant="ghost" size="icon" onClick={open} aria-label={`Editar ${n.title}`}>
                      <Pencil />
                    </Button>
                  )}
                >
                  {(state) => <NewsFields state={state} news={n} />}
                </EntityDialog>
                <form action={deleteNews}>
                  <input type="hidden" name="id" value={n.id} />
                  <ConfirmSubmit message={`Apagar a notícia "${n.title}"?`} size="icon" title={`Apagar ${n.title}`}>
                    <Trash2 />
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
