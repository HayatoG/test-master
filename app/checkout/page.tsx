import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutFlow } from "./CheckoutFlow";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div>
      <PageHeader
        title="Checkout"
        difficulty="difícil"
        description="Três etapas: endereço, pagamento e revisão. Cartão de teste aprovado: 4111 1111 1111 1111. Recusado: 4000 0000 0000 0002."
      />
      <CheckoutFlow />
    </div>
  );
}
