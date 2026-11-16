"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal, SubmitButton } from "@/components/ui/client";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/misc";
import type { FormState } from "@/lib/validation";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Modal com um formulário de criar/editar (como os modais do relatório original).
 * - `trigger` recebe a função que abre o modal.
 * - `children` recebe o estado do formulário (erros e valores) para preencher os campos.
 */
export function EntityDialog({
  title,
  description,
  action,
  trigger,
  submitLabel = "Guardar",
  children,
  wide,
}: {
  title: string;
  description?: string;
  action: Action;
  trigger: (open: () => void) => React.ReactNode;
  submitLabel?: string;
  children: (state: FormState) => React.ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger(() => setOpen(true))}
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description} className={wide ? "w-[min(44rem,calc(100vw-2rem))]" : undefined}>
        <InnerForm action={action} onDone={() => setOpen(false)} submitLabel={submitLabel} onCancel={() => setOpen(false)}>
          {children}
        </InnerForm>
      </Modal>
    </>
  );
}

function InnerForm({
  action,
  onDone,
  onCancel,
  submitLabel,
  children,
}: {
  action: Action;
  onDone: () => void;
  onCancel: () => void;
  submitLabel: string;
  children: (state: FormState) => React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      onDone();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="grid gap-4">
      {!state?.ok && <FormMessage state={state} />}
      {children(state)}
      <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <SubmitButton pendingText="A guardar...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

/** Formulário de uma linha só com um botão de apagar com confirmação. */
export { ConfirmSubmit } from "@/components/ui/client";
