"use client";

import { useActionState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cancelRegistration, saveRegistration } from "@/app/actions/registrations";
import { ConfirmSubmit, SubmitButton } from "@/components/ui/client";
import { FormMessage } from "@/components/ui/misc";
import { useState } from "react";

export function RegistrationForm({
  activityId,
  current,
  max,
  waitlistPosition,
  joinsWaitlist,
}: {
  activityId: string;
  current: number | null;
  max: number;
  /** Posição na lista de espera, se a inscrição estiver em espera. */
  waitlistPosition: number | null;
  /** Inscrição nova que vai para a lista de espera (esgotado ou já há fila). */
  joinsWaitlist: boolean;
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
