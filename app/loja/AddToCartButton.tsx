"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/lib/cart/useCart";

export function AddToCartButton({ productId, productName, disabled }: { productId: number; productName: string; disabled: boolean }) {
  const { add } = useCart();
  const toast = useToast();
  return (
    <Button
      className="mt-3"
      disabled={disabled}
      onClick={() => {
        if (add(productId)) toast(`${productName} adicionado ao carrinho`);
        else toast(`Estoque insuficiente para ${productName}`, "error");
      }}
    >
      {disabled ? "Indisponível" : "Adicionar ao carrinho"}
    </Button>
  );
}
