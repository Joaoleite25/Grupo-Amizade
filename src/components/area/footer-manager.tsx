"use client";

import { useState } from "react";
import { Info, Link2, PanelBottom, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteFooter, saveFooter } from "@/app/actions/admin";
import { EntityDialog } from "@/components/area/entity-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/client";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ChoiceGroup, FormSection } from "@/components/ui/form-kit";
import { EmptyState } from "@/components/ui/misc";
import type { FormState } from "@/lib/validation";

type Item = { id: string; kind: "INFO" | "SOCIAL"; title: string; content: string; url: string | null };

function FooterFields({ state, item }: { state: FormState; item?: Item }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  const [kind, setKind] = useState<Item["kind"]>((v?.kind as Item["kind"]) ?? item?.kind ?? "INFO");
  const social = kind === "SOCIAL";
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormSection title="Tipo">
        <ChoiceGroup
          label="O que queres mostrar no rodapé?"
          name="kind"
          value={kind}
          onChange={setKind}
          options={[
            { value: "INFO", label: "Informação", description: "Morada, email, telefone…", icon: <Info /> },
            { value: "SOCIAL", label: "Rede social", description: "Instagram, Facebook…", icon: <Link2 /> },
          ]}
        />
      </FormSection>
      <FormSection title={social ? "Rede social" : "Informação"}>
        <Field label="Título" name="title" errors={e.title}>
          <Input id="title" name="title" placeholder={social ? "Ex.: Instagram" : "Ex.: Morada"} defaultValue={v?.title ?? item?.title} required />
        </Field>
        <Field label={social ? "Nome a mostrar" : "Texto"} name="content" errors={e.content}>
          {social ? (
            <Input id="content" name="content" placeholder="Ex.: @grupoamizade" defaultValue={v?.content ?? item?.content} required />
          ) : (
            <Textarea id="content" name="content" rows={3} className="min-h-0" placeholder="Ex.: Rua da Igreja, 4520 São João de Ver" defaultValue={v?.content ?? item?.content} required />
          )}
        </Field>
        <Field label="Link" name="url" errors={e.url} optional={!social} hint={social ? "Endereço da página na rede social." : undefined}>
          <Input id="url" name="url" type="url" placeholder="https://" defaultValue={v?.url ?? item?.url ?? ""} required={social} />
        </Field>
      </FormSection>
    </>
  );
}

export function FooterManager({ items, canEdit, canCreate }: { items: Item[]; canEdit: boolean; canCreate: boolean }) {
  const groups = [
    { title: "Informações", items: items.filter((i) => i.kind === "INFO") },
    { title: "Redes sociais", items: items.filter((i) => i.kind === "SOCIAL") },
  ];

  return (
    <div className="space-y-8">
      {canCreate && (
        <div className="flex justify-end">
          <EntityDialog
            title="Nova informação"
            action={saveFooter}
            submitLabel="Criar"
            trigger={(open) => (
              <Button onClick={open}>
                <Plus /> Nova informação
              </Button>
            )}
          >
            {(state) => <FooterFields state={state} />}
          </EntityDialog>
        </div>
      )}

      {items.length === 0 && <EmptyState icon={<PanelBottom />} title="O rodapé está vazio" />}

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.title}>
              <h2 className="mb-3 text-sm font-semibold tracking-wider text-muted uppercase">{g.title}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wider text-muted uppercase">{item.title}</p>
                      <p className="mt-1 text-sm whitespace-pre-line">{item.content}</p>
                      {item.url && (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-accent">
                          <Link2 className="size-3" /> {item.url}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {canEdit && (
                        <EntityDialog
                          title="Editar informação"
                          action={saveFooter}
                          trigger={(open) => (
                            <Button variant="ghost" size="icon" onClick={open} aria-label={`Editar ${item.title}`}>
                              <Pencil />
                            </Button>
                          )}
                        >
                          {(state) => <FooterFields state={state} item={item} />}
                        </EntityDialog>
                      )}
                      {canCreate && (
                        <form action={deleteFooter}>
                          <input type="hidden" name="id" value={item.id} />
                          <ConfirmSubmit message={`Apagar "${item.title}" do rodapé?`} size="icon" title={`Apagar ${item.title}`}>
                            <Trash2 />
                          </ConfirmSubmit>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
