import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = { title: "Trocar senha" };

export default function TrocarSenhaPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Trocar senha" description="Sua senha expirou. Defina uma nova senha para continuar." />
      <ChangePasswordForm />
    </div>
  );
}
