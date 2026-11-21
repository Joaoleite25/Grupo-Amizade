"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Painel lateral com um formulário de criar/editar.
 * - `trigger` recebe a função que abre o painel.
 * - `children` recebe o estado do formulário (erros e valores) para preencher os campos.
 * O cabeçalho e os botões ficam sempre visíveis; só os campos fazem scroll.
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
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      {trigger(() => setOpen(true))}
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        // Clicar fora do painel (no fundo escurecido) fecha-o.
        onClick={(e) => e.target === ref.current && setOpen(false)}
        aria-labelledby="entity-dialog-title"
        className={cn(
          // overflow-hidden: só a zona dos campos faz scroll; cabeçalho e botões nunca saem do sítio.
          "sheet m-0 ml-auto h-dvh max-h-dvh w-full max-w-full overflow-hidden border-0 bg-surface p-0 text-fg shadow-2xl",
          "sm:w-[min(34rem,calc(100vw-2rem))] sm:rounded-l-2xl",
          wide && "sm:w-[min(42rem,calc(100vw-2rem))]",
        )}
      >
        {open && (
          <InnerForm
            title={title}
            description={description}
            action={action}
            submitLabel={submitLabel}
            onClose={() => setOpen(false)}
          >
            {children}
          </InnerForm>
        )}
      </dialog>
    </>
  );
}

function InnerForm({
  title,
  description,
  action,
  onClose,
  submitLabel,
  children,
}: {
  title: string;
  description?: string;
  action: Action;
  onClose: () => void;
  submitLabel: string;
  children: (state: FormState) => React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Envia "à mão" em vez de <form action>: assim o React não limpa o formulário depois
  // de enviar. Se houver um erro, fica tudo como a pessoa deixou (incluindo a foto
  // escolhida e as opções marcadas), em vez de voltar aos valores iniciais.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      onClose();
    } else if (state) {
      // Com erros, volta ao topo para se ver a mensagem e o primeiro campo errado.
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col" aria-busy={pending}>
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 id="entity-dialog-title" className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="-mt-1 -mr-2">
          <X />
        </Button>
      </header>

      {/* relative: os campos escondidos (sr-only, com position:absolute) ficam presos a esta zona
          e não fazem o painel inteiro crescer e deslizar. */}
      <div ref={bodyRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        <div className="grid gap-6">
          {!state?.ok && <FormMessage state={state} />}
          {children(state)}
        </div>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface-2/60 px-6 py-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> A guardar...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </footer>
    </form>
  );
}
