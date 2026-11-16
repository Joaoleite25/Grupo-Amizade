import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Nova palavra-passe" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Nova palavra-passe</h1>
      <p className="mt-2 mb-8 text-muted">Escolhe uma nova palavra-passe para a tua conta.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
