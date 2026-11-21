"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ClipboardList, Globe, Infinity as InfinityIcon, Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { deleteActivity, saveActivity } from "@/app/actions/admin";
import { EntityDialog } from "@/components/area/entity-dialog";
import { Button, buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/client";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ChoiceGroup, FormSection, ImageInput } from "@/components/ui/form-kit";
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

function ActivityFields({ state, activity }: { state: FormState; activity?: ActivityRow }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  const [limited, setLimited] = useState(v?.limited ?? (activity?.capacity != null ? "yes" : "no"));

  return (
    <>
      {activity && <input type="hidden" name="id" value={activity.id} />}

      <FormSection title="Informação">
        <Field label="Título" name="title" errors={e.title}>
          <Input id="title" name="title" placeholder="Ex.: Caminhada solidária" defaultValue={v?.title ?? activity?.title} required />
        </Field>
        <Field label="Descrição" name="description" errors={e.description}>
          <Textarea
            id="description"
            name="description"
            rows={5}
            placeholder="O que vai acontecer, para quem é, porque vale a pena ir…"
            defaultValue={v?.description ?? activity?.description}
            required
          />
        </Field>
        <ChoiceGroup
          label="Quem pode ver e inscrever-se"
          name="visibility"
          value={(v?.visibility ?? activity?.visibility ?? "EXTERNAL") as "EXTERNAL" | "INTERNAL"}
          options={[
            { value: "EXTERNAL", label: "Externa", description: "Aberta a todos os utilizadores", icon: <Globe /> },
            { value: "INTERNAL", label: "Interna", description: "Só membros do grupo", icon: <Lock /> },
          ]}
        />
      </FormSection>

      <FormSection title="Data e hora">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Início" name="date" errors={e.date}>
            <Input id="date" name="date" type="datetime-local" defaultValue={v?.date ?? activity?.inputs.date} required />
          </Field>
          <Field label="Fim" name="endsAt" errors={e.endsAt} optional hint="Sem fim, os calendários assumem 2 horas.">
            <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={v?.endsAt ?? activity?.inputs.endsAt} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Inscrições" description="Quando abrem e fecham, e quantas pessoas podem ir.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Abrem" name="registrationOpens" errors={e.registrationOpens}>
            <Input
              id="registrationOpens"
              name="registrationOpens"
              type="datetime-local"
              defaultValue={v?.registrationOpens ?? activity?.inputs.registrationOpens}
              required
            />
          </Field>
          <Field label="Fecham" name="registrationEnds" errors={e.registrationEnds}>
            <Input
              id="registrationEnds"
              name="registrationEnds"
              type="datetime-local"
              defaultValue={v?.registrationEnds ?? activity?.inputs.registrationEnds}
              required
            />
          </Field>
        </div>
        <ChoiceGroup
          label="Vagas"
          name="limited"
          value={limited as "no" | "yes"}
          onChange={setLimited}
          options={[
            { value: "no", label: "Sem limite", description: "Qualquer pessoa se pode inscrever", icon: <InfinityIcon /> },
            { value: "yes", label: "Limitadas", description: "Quando esgotar, abre lista de espera", icon: <Users /> },
          ]}
        />
        {limited === "yes" && (
          <Field label="Número de vagas" name="capacity" errors={e.capacity}>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Ex.: 30"
              className="max-w-40"
              defaultValue={v?.capacity ?? activity?.capacity ?? ""}
              required
            />
          </Field>
        )}
      </FormSection>

      <FormSection title="Detalhes" description="Aparecem na página da atividade e no email de confirmação.">
        <Field label="Local" name="location" errors={e.location} optional hint="Morada ou nome do sítio. Abre no mapa.">
          <Input id="location" name="location" placeholder="Ex.: Igreja de São João de Ver" defaultValue={v?.location ?? activity?.location ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Idade recomendada" name="ages" errors={e.ages} optional>
            <Input id="ages" name="ages" placeholder="Ex.: 8 aos 14 anos" defaultValue={v?.ages ?? activity?.ages ?? ""} />
          </Field>
          <Field label="Mais informação (link)" name="link" errors={e.link} optional>
            <Input id="link" name="link" type="url" placeholder="https://" defaultValue={v?.link ?? activity?.link ?? ""} />
          </Field>
        </div>
        <Field label="O que levar" name="bring" errors={e.bring} optional>
          <Textarea
            id="bring"
            name="bring"
            rows={2}
            className="min-h-0"
            placeholder="Ex.: Calçado confortável, água e um lanche."
            defaultValue={v?.bring ?? activity?.bring ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection title="Fotografia" description="Opcional. Aparece no cartão e no topo da página da atividade.">
        <ImageInput name="image" current={activity?.image} removeName="removeImage" errors={e.image} />
      </FormSection>
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
          description="Preenche o essencial; os detalhes podem ficar para depois."
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
                        description={a.title}
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
