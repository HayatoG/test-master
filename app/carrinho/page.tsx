import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Carrinho" };

export default function CarrinhoPage() {
  return (
    <div>
      <PageHeader title="Carrinho" difficulty="difícil" description="Cupons: QA10, FRETEGRATIS, MINIMO100 e EXPIRADO. Calcule o frete pelo CEP (99999-999 simula CEP inexistente)." />
      <CartView />
    </div>
  );
}
