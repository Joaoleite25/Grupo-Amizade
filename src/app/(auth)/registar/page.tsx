import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-2 mb-8 text-muted">Regista-te para te inscreveres nas atividades do grupo.</p>
      <RegisterForm />
      <p className="mt-8 text-center text-sm text-muted">
        Já tens conta?{" "}
        <Link href="/entrar" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
