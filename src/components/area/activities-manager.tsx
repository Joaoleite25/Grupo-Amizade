"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteActivity, saveActivity } from "@/app/actions/admin";
import { EntityDialog } from "@/components/area/entity-dialog";
import { Button, buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/client";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { formatDateTime } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

export type ActivityRow = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  date: Date;
  capacity: number | null;
  visibility: "INTERNAL" | "EXTERNAL";
  link: string | null;
  location: string | null;
  ages: string | null;
  bring: string | null;
  registered: number;
  waiting: number;
  // Valores já formatados para <input type="datetime-local"> em hora de Lisboa
  inputs: { date: string; endsAt: string; registrationOpens: string; registrationEnds: string };
};

const fileClass = "py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs";

function ActivityFields({ state, activity }: { state: FormState; activity?: ActivityRow }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  const [limited, setLimited] = useState(v?.limited ?? (activity?.capacity != null ? "yes" : "no"));

  return (
    <>
      {activity && <input type="hidden" name="id" value={activity.id} />}
      <Field label="Título" name="title" errors={e.title}>
        <Input id="title" name="title" defaultValue={v?.title ?? activity?.title} required />
      </Field>
      <Field label="Descrição" name="description" errors={e.description}>
        <Textarea id="description" name="description" rows={5} defaultValue={v?.description ?? activity?.description} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Início da atividade" name="date" errors={e.date}>
          <Input id="date" name="date" type="datetime-local" defaultValue={v?.date ?? activity?.inputs.date} required />
        </Field>
        <Field label="Fim" name="endsAt" errors={e.endsAt} hint="Opcional. Sem fim, os calendários assumem 2 horas.">
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={v?.endsAt ?? activity?.inputs.endsAt} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Abertura inscrições" name="registrationOpens" errors={e.registrationOpens}>
          <Input
            id="registrationOpens"
            name="registrationOpens"
            type="datetime-local"
            defaultValue={v?.registrationOpens ?? activity?.inputs.registrationOpens}
            required
          />
        </Field>
        <Field label="Fecho inscrições" name="registrationEnds" errors={e.registrationEnds}>
          <Input
            id="registrationEnds"
            name="registrationEnds"
            type="datetime-local"
            defaultValue={v?.registrationEnds ?? activity?.inputs.registrationEnds}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Capacidade" name="limited">
          <Select id="limited" name="limited" value={limited} onChange={(ev) => setLimited(ev.target.value)}>
            <option value="no">Sem limite</option>
            <option value="yes">Limitada</option>
          </Select>
        </Field>
        {limited === "yes" ? (
          <Field label="Limite de pessoas" name="capacity" errors={e.capacity}>
            <Input id="capacity" name="capacity" type="number" min={1} defaultValue={v?.capacity ?? activity?.capacity ?? ""} required />
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="Exposição" name="visibility">
          <Select id="visibility" name="visibility" defaultValue={v?.visibility ?? activity?.visibility ?? "EXTERNAL"}>
            <option value="EXTERNAL">Externa (todos)</option>
            <option value="INTERNAL">Interna (membros)</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <Field label="Local" name="location" errors={e.location} hint="Morada ou nome do sítio. Abre no mapa.">
          <Input id="location" name="location" placeholder="Ex.: Igreja de São João de Ver" defaultValue={v?.location ?? activity?.location ?? ""} />
        </Field>
        <Field label="Idade recomendada" name="ages" errors={e.ages} hint="Opcional.">
          <Input id="ages" name="ages" placeholder="Ex.: 8 aos 14 anos" defaultValue={v?.ages ?? activity?.ages ?? ""} />
        </Field>
      </div>
      <Field label="O que levar" name="bring" errors={e.bring} hint="Opcional. Aparece na página e no email de confirmação.">
        <Textarea id="bring" name="bring" rows={2} placeholder="Ex.: Calçado confortável, água e um lanche." defaultValue={v?.bring ?? activity?.bring ?? ""} />
      </Field>

      <Field label="Foto" name="image" errors={e.image} hint={activity?.image ? "Deixa vazio para manter a atual." : "Opcional."}>
        <Input id="image" name="image" type="file" accept="image/*" className={fileClass} />
      </Field>
      {activity?.image && (
        <label className="-mt-2 flex items-center gap-3 text-sm text-muted">
          <input type="checkbox" name="removeImage" className="size-4 accent-[var(--accent)]" /> Remover a foto atual
        </label>
      )}
      <Field label="Ligação" name="link" errors={e.link} hint="Opcional.">
        <Input id="link" name="link" type="url" placeholder="https://" defaultValue={v?.link ?? activity?.link ?? ""} />
      </Field>
    </>
  );
}

export function ActivitiesManager({ activities, nowMs }: { activities: ActivityRow[]; nowMs: number }) {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const list = activities.filter((a) => (filter === "upcoming" ? a.date.getTime() >= nowMs : a.date.getTime() < nowMs));
  if (filter === "past") list.reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-sm" role="tablist">
          {(["upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className="rounded-md px-3 py-1.5 font-medium text-muted aria-selected:bg-surface-2 aria-selected:text-fg"
            >
              {f === "upcoming" ? "Próximas" : "Passadas"}
            </button>
          ))}
        </div>
        <EntityDialog
          title="Nova atividade"
          action={saveActivity}
          submitLabel="Criar"
          wide
          trigger={(open) => (
            <Button onClick={open}>
              <Plus /> Nova atividade
            </Button>
          )}
        >
          {(state) => <ActivityFields state={state} />}
        </EntityDialog>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title={filter === "upcoming" ? "Não há atividades marcadas" : "Não há atividades passadas"} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Atividade</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Inscritos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.title}</span>
                      {a.visibility === "INTERNAL" && <Badge tone="internal">Interna</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(a.date)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {a.registered}
                    <span className="text-muted">{a.capacity !== null ? ` / ${a.capacity}` : " · sem limite"}</span>
                    {a.waiting > 0 && <Badge tone="warning" className="ml-2">{a.waiting} em espera</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/area/gestao/inscricoes/${a.id}`} className={buttonClass("ghost", "icon")} aria-label="Ver inscrições" title="Ver inscrições">
                        <ClipboardList />
                      </Link>
                      <EntityDialog
                        title="Editar atividade"
                        action={saveActivity}
                        wide
                        trigger={(open) => (
                          <Button variant="ghost" size="icon" onClick={open} aria-label={`Editar ${a.title}`} title="Editar">
                            <Pencil />
                          </Button>
                        )}
                      >
                        {(state) => <ActivityFields state={state} activity={a} />}
                      </EntityDialog>
                      <form action={deleteActivity}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmSubmit
                          message={`Apagar "${a.title}"? ${a.registered > 0 ? `As ${a.registered} inscrições também vão ser apagadas.` : ""}`}
                          size="icon"
                          title="Apagar"
                        >
                          <Trash2 />
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
