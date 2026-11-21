"use client";

import { useActionState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cancelRegistration, saveRegistration } from "@/app/actions/registrations";
import { ConfirmSubmit, SubmitButton } from "@/components/ui/client";
import { FormMessage } from "@/components/ui/misc";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import type { FormState } from "@/lib/validation";

/** Dados e autorização do encarregado de educação (participantes com menos de 16 anos). */
function GuardianFields({ guardian, state }: { guardian: { name: string; phone: string }; state: FormState }) {
  const e = state?.errors ?? {};
  const v = state?.values;
  return (
    <fieldset className="space-y-3 rounded-xl border border-border bg-surface-2/50 p-4">
      <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold">
        <ShieldCheck className="size-4 text-accent" /> Autorização do encarregado de educação
      </legend>
      <p className="text-xs text-muted">Como tens menos de 16 anos, precisamos dos dados e da autorização de um encarregado de educação.</p>
      <Field label="Nome do encarregado" name="guardianName" errors={e.guardianName}>
        <Input id="guardianName" name="guardianName" autoComplete="off" defaultValue={v?.guardianName ?? guardian.name} required />
      </Field>
      <Field label="Telemóvel do encarregado" name="guardianPhone" errors={e.guardianPhone}>
        <Input id="guardianPhone" name="guardianPhone" type="tel" inputMode="tel" autoComplete="off" placeholder="912 345 678" defaultValue={v?.guardianPhone ?? guardian.phone} required />
      </Field>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="guardianConsent" className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" defaultChecked={v?.guardianConsent === "on"} required />
        <span>O encarregado de educação autoriza a participação nesta atividade.</span>
      </label>
      {e.guardianConsent?.map((m) => (
        <p key={m} className="text-xs font-medium text-danger">{m}</p>
      ))}
    </fieldset>
  );
}

export function RegistrationForm({
  activityId,
  current,
  max,
  waitlistPosition,
  joinsWaitlist,
  guardian,
}: {
  activityId: string;
  current: number | null;
  max: number;
  /** Posição na lista de espera, se a inscrição estiver em espera. */
  waitlistPosition: number | null;
  /** Inscrição nova que vai para a lista de espera (esgotado ou já há fila). */
  joinsWaitlist: boolean;
  /** Preenchido quando o participante tem menos de 16 anos: pede a autorização do encarregado. */
  guardian: { name: string; phone: string } | null;
}) {
  const [state, action] = useActionState(saveRegistration, undefined);
  const [count, setCount] = useState(current ?? 1);

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
  }, [state]);

  const people = `${current} pessoa${current === 1 ? "" : "s"}`;
  const submitLabel =
    current === null ? (joinsWaitlist ? "Entrar na lista de espera" : "Inscrever-me") : "Atualizar inscrição";

  return (
    <div className="space-y-4">
      {current !== null &&
        (waitlistPosition !== null ? (
          <p className="rounded-lg bg-warning-soft px-3 py-2.5 text-sm font-medium text-warning-fg">
            Estás na lista de espera (posição {waitlistPosition}, {people}). Se abrir uma vaga, a inscrição é confirmada
            automaticamente e recebes um email.
          </p>
        ) : (
          <p className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent-soft-fg">
            Estás inscrito com {people}.
          </p>
        ))}
      {current === null && joinsWaitlist && (
        <p className="text-sm text-muted">
          Já não há vagas livres. Entra na lista de espera: por ordem de chegada, a tua inscrição é confirmada
          automaticamente se alguém cancelar, e avisamos-te por email.
        </p>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="activityId" value={activityId} />
        <div>
          <label htmlFor="participants" className="text-sm font-medium">
            Número de pessoas
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              disabled={count <= 1}
              aria-label="Menos uma pessoa"
              className="grid size-10 place-items-center rounded-lg border border-border hover:bg-surface-2 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <input
              id="participants"
              name="participants"
              type="number"
              inputMode="numeric"
              min={1}
              max={max}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
              className="h-10 w-full rounded-lg border border-border bg-surface text-center font-semibold tabular-nums focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(max, c + 1))}
              disabled={count >= max}
              aria-label="Mais uma pessoa"
              className="grid size-10 place-items-center rounded-lg border border-border hover:bg-surface-2 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {state?.errors?.participants?.map((e) => (
            <p key={e} className="mt-1.5 text-xs font-medium text-danger">
              {e}
            </p>
          ))}
        </div>
        {guardian && <GuardianFields guardian={guardian} state={state} />}
        {!state?.ok && <FormMessage state={state} />}
        <SubmitButton className="w-full" pendingText="A guardar...">
          {submitLabel}
        </SubmitButton>
      </form>
      {current !== null && (
        <form action={cancelRegistration}>
          <input type="hidden" name="activityId" value={activityId} />
          <ConfirmSubmit
            message={waitlistPosition !== null ? "Queres sair da lista de espera?" : "Queres mesmo cancelar a inscrição?"}
            variant="danger-ghost"
            size="md"
            className="w-full"
          >
            {waitlistPosition !== null ? "Sair da lista de espera" : "Cancelar inscrição"}
          </ConfirmSubmit>
        </form>
      )}
    </div>
  );
}
