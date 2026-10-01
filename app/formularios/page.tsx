import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegistrationForm } from "./RegistrationForm";

export const metadata: Metadata = { title: "Formulários" };

export default function FormulariosPage() {
  return (
    <div>
      <PageHeader
        title="Formulários"
        difficulty="médio"
        description="Cadastro com validações, máscaras e campos condicionais. O e-mail existente@qa.com simula erro de e-mail já cadastrado."
      />
      <RegistrationForm />
    </div>
  );
}
