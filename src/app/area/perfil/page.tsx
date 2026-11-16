import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { toDateInputValue } from "@/lib/utils";
import { PageHeader } from "@/components/area/page-header";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/area/profile-forms";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Perfil" description={`@${user.username} · ${user.role.name}`} />
      <div className="max-w-2xl space-y-6">
        <ProfileForm
          defaults={{ name: user.name, email: user.email, birthDate: toDateInputValue(user.birthDate) }}
        />
        <PasswordForm />
        <DeleteAccountForm />
      </div>
    </>
  );
}
