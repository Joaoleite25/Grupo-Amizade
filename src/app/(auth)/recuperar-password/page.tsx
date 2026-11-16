import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Recuperar palavra-passe" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Recuperar palavra-passe</h1>
      <p className="mt-2 mb-8 text-muted">Indica o email da tua conta e enviamos-te um link para definires uma nova.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/entrar" className="font-medium text-accent hover:underline">
          Voltar ao login
        </Link>
      </p>
    </>
  );
}
