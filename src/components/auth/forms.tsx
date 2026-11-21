"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login, register, requestPasswordReset, resetPassword } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/client";
import { FormMessage } from "@/components/ui/misc";
import { HONEYPOT } from "@/lib/validation";

function PasswordInput(props: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className="pr-10" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-fg"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  const next = useSearchParams().get("next") ?? "";
  const v = state?.values ?? {};

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field label="Utilizador ou email" name="identifier" errors={state?.errors?.identifier}>
        <Input id="identifier" name="identifier" autoComplete="username" defaultValue={v.identifier} autoFocus required />
      </Field>
      <div className="grid gap-1.5">
        <Field label="Palavra-passe" name="password" errors={state?.errors?.password}>
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </Field>
        <Link href="/recuperar-password" className="justify-self-end text-xs font-medium text-accent hover:underline">
          Esqueceste-te da palavra-passe?
        </Link>
      </div>
      <SubmitButton size="lg" pendingText="A entrar...">
        Entrar
      </SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      {/* Armadilha para robôs: escondida das pessoas e dos leitores de ecrã. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={HONEYPOT}>Não preenchas este campo</label>
        <input id={HONEYPOT} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <Field label="Nome completo" name="name" errors={e.name}>
        <Input id="name" name="name" autoComplete="name" defaultValue={v.name} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome de utilizador" name="username" errors={e.username}>
          <Input id="username" name="username" autoComplete="username" defaultValue={v.username} required />
        </Field>
        <Field label="Data de nascimento" name="birthDate" errors={e.birthDate}>
          <Input id="birthDate" name="birthDate" type="date" defaultValue={v.birthDate} required />
        </Field>
      </div>
      <Field label="Email" name="email" errors={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} required />
      </Field>
      <Field label="Palavra-passe" name="password" errors={e.password} hint="Pelo menos 8 caracteres, com letras e números.">
        <PasswordInput id="password" name="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirmar palavra-passe" name="confirmPassword" errors={e.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
      </Field>
      <div className="grid gap-1.5">
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="consent" defaultChecked={v.consent === "on"} className="mt-0.5 size-4 accent-[var(--accent)]" />
          <span>
            Li e aceito a{" "}
            <Link href="/privacidade" target="_blank" className="font-medium text-accent hover:underline">
              política de privacidade
            </Link>
            . Se tenho menos de 16 anos, o meu encarregado de educação autorizou o registo.
          </span>
        </label>
        {e.consent?.map((m) => (
          <p key={m} className="text-xs font-medium text-danger">
            {m}
          </p>
        ))}
      </div>
      <SubmitButton size="lg" pendingText="A criar conta..." className="mt-2">
        Criar conta
      </SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-5">
      <Field label="Email da conta" name="email" errors={state?.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" autoFocus required />
      </Field>
      <SubmitButton size="lg" pendingText="A enviar...">
        Enviar link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, undefined);
  const token = useSearchParams().get("token") ?? "";
  const e = state?.errors ?? {};

  if (!token) {
    return <FormMessage state={{ message: "Link inválido. Pede um novo link de recuperação." }} />;
  }
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field label="Nova palavra-passe" name="password" errors={e.password} hint="Pelo menos 8 caracteres, com letras e números.">
        <PasswordInput id="password" name="password" autoComplete="new-password" autoFocus required />
      </Field>
      <Field label="Confirmar palavra-passe" name="confirmPassword" errors={e.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
      </Field>
      <SubmitButton size="lg" pendingText="A guardar...">
        Guardar palavra-passe
      </SubmitButton>
    </form>
  );
}
