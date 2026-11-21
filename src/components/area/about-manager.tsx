"use client";

import { ArrowDown, ArrowUp, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteAbout, moveAbout, saveAbout } from "@/app/actions/admin";
import { EntityDialog } from "@/components/area/entity-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/client";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-kit";
import { EmptyState } from "@/components/ui/misc";
import { excerpt } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

type Section = { id: string; title: string; body: string };

function AboutFields({ state, section }: { state: FormState; section?: Section }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  return (
    <>
      {section && <input type="hidden" name="id" value={section.id} />}
      <FormSection title="Texto" description="O primeiro texto da lista aparece em destaque na página inicial.">
        <Field label="Título" name="title" errors={e.title}>
          <Input id="title" name="title" placeholder="Ex.: Quem somos" defaultValue={v?.title ?? section?.title} required />
        </Field>
        <Field label="Texto" name="body" errors={e.body}>
          <Textarea id="body" name="body" rows={10} defaultValue={v?.body ?? section?.body} required />
        </Field>
      </FormSection>
    </>
  );
}

export function AboutManager({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <EntityDialog
          title="Novo texto"
          action={saveAbout}
          submitLabel="Criar"
          trigger={(open) => (
            <Button onClick={open}>
              <Plus /> Novo texto
            </Button>
          )}
        >
          {(state) => <AboutFields state={state} />}
        </EntityDialog>
      </div>

      {sections.length === 0 ? (
        <EmptyState icon={<Info />} title="Ainda não há textos">
          O primeiro texto aparece em destaque na página principal.
        </EmptyState>
      ) : (
        <ol className="space-y-3">
          {sections.map((s, i) => (
            <li key={s.id} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-semibold text-muted tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{excerpt(s.body, 220)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <form action={moveAbout} className="flex flex-col sm:flex-row">
                  <input type="hidden" name="id" value={s.id} />
                  <Button variant="ghost" size="icon" name="dir" value="up" disabled={i === 0} aria-label="Subir">
                    <ArrowUp />
                  </Button>
                  <Button variant="ghost" size="icon" name="dir" value="down" disabled={i === sections.length - 1} aria-label="Descer">
                    <ArrowDown />
                  </Button>
                </form>
                <EntityDialog
                  title="Editar texto"
                  action={saveAbout}
                  trigger={(open) => (
                    <Button variant="ghost" size="icon" onClick={open} aria-label={`Editar ${s.title}`}>
                      <Pencil />
                    </Button>
                  )}
                >
                  {(state) => <AboutFields state={state} section={s} />}
                </EntityDialog>
                <form action={deleteAbout}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmSubmit message={`Apagar o texto "${s.title}"?`} size="icon" title={`Apagar ${s.title}`}>
                    <Trash2 />
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
