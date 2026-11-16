import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 mb-8 text-muted">Entra na tua conta para gerires as tuas inscrições.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted">
        Ainda não tens conta?{" "}
        <Link href="/registar" className="font-medium text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}
