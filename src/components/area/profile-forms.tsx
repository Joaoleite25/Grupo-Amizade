"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changePassword, deleteAccount, updateProfile } from "@/app/actions/account";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/client";
import { Card, FormMessage } from "@/components/ui/misc";
import type { FormState } from "@/lib/validation";

function useToastOnSuccess(state: FormState, onSuccess?: () => void) {
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      onSuccess?.();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function ProfileForm({ defaults }: { defaults: { name: string; email: string; birthDate: string } }) {
  const [state, action] = useActionState(updateProfile, undefined);
  useToastOnSuccess(state);
  const e = state?.errors ?? {};
  const v = { ...defaults, ...(state?.ok ? {} : state?.values) };

  return (
    <Section title="Dados pessoais">
      <form action={action} className="grid gap-4">
        {!state?.ok && <FormMessage state={state} />}
        <Field label="Nome completo" name="name" errors={e.name}>
          <Input id="name" name="name" defaultValue={v.name} autoComplete="name" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" errors={e.email}>
            <Input id="email" name="email" type="email" defaultValue={v.email} autoComplete="email" required />
          </Field>
          <Field label="Data de nascimento" name="birthDate" errors={e.birthDate}>
            <Input id="birthDate" name="birthDate" type="date" defaultValue={v.birthDate} required />
          </Field>
        </div>
        <div>
          <SubmitButton pendingText="A guardar...">Guardar alterações</SubmitButton>
        </div>
      </form>
    </Section>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useToastOnSuccess(state, () => ref.current?.reset());
  const e = state?.errors ?? {};

  return (
    <Section title="Palavra-passe">
      <form ref={ref} action={action} className="grid gap-4">
        <Field label="Palavra-passe atual" name="currentPassword" errors={e.currentPassword}>
          <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nova palavra-passe" name="password" errors={e.password}>
            <Input id="password" name="password" type="password" autoComplete="new-password" required />
          </Field>
          <Field label="Confirmar" name="confirmPassword" errors={e.confirmPassword}>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          </Field>
        </div>
        <div>
          <SubmitButton variant="secondary" pendingText="A alterar...">
            Alterar palavra-passe
          </SubmitButton>
        </div>
      </form>
    </Section>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, undefined);
  return (
    <Card className="border-danger/30 p-6">
      <h2 className="font-semibold tracking-tight text-danger">Apagar conta</h2>
      <p className="mt-1 text-sm text-muted">
        Apaga a tua conta e todas as tuas inscrições. Esta ação não pode ser desfeita.
      </p>
      <form
        action={action}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={(ev) => {
          if (!confirm("Tens a certeza? A conta e as inscrições vão ser apagadas para sempre.")) ev.preventDefault();
        }}
      >
        <div className="flex-1">
          <Input name="password" type="password" placeholder="Confirma com a tua palavra-passe" aria-label="Palavra-passe" required />
          {state?.errors?.password?.map((m) => (
            <p key={m} className="mt-1.5 text-xs font-medium text-danger">
              {m}
            </p>
          ))}
        </div>
        <SubmitButton variant="danger" pendingText="A apagar...">
          Apagar conta
        </SubmitButton>
      </form>
      {state?.message && <div className="mt-3"><FormMessage state={state} /></div>}
    </Card>
  );
}
