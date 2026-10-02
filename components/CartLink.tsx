"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/useCart";

export function CartLink() {
  const { count, hydrated } = useCart();
  return (
    <Link href="/carrinho" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
      Carrinho
      <span data-testid="cart-badge" aria-label={`${count} ${count === 1 ? "item" : "itens"} no carrinho`} className="min-w-6 rounded-full bg-brand-700 px-2 py-0.5 text-center text-xs text-white">
        {hydrated ? count : 0}
      </span>
    </Link>
  );
}
