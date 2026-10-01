"use client";

import { useBugs } from "@/lib/bugs/BugsProvider";
import { computeTotals } from "@/lib/domain/cart";
import type { ShippingQuote } from "@/lib/domain/shipping";
import { findCoupon, type Coupon } from "@/lib/seed/coupons";
import { findProduct, type Product } from "@/lib/seed/products";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useLocalStore } from "@/lib/storage/useLocalStore";

export type CartItem = { productId: number; qty: number };
export type CartState = { items: CartItem[]; coupons: string[]; shipping: ShippingQuote | null };
export type CartLineView = CartItem & { product: Product; lineTotal: number };

const EMPTY: CartState = { items: [], coupons: [], shipping: null };

/**
 * Carrinho persistido no localStorage. Os itens ficam na ordem em que foram
 * adicionados pela primeira vez. A loja usa o catálogo fixo (seed), não os
 * produtos editados no CRUD.
 */
export function useCart() {
  const [cart, setCart, hydrated] = useLocalStore<CartState>(STORAGE_KEYS.cart, EMPTY);
  const { enabled: bugs } = useBugs();

  const lines: CartLineView[] = cart.items.flatMap((item) => {
    const product = findProduct(item.productId);
    return product ? [{ ...item, product, lineTotal: Math.round(product.price * item.qty * 100) / 100 }] : [];
  });
  const coupons = cart.coupons.map(findCoupon).filter((c): c is Coupon => !!c);
  const totals = computeTotals(
    lines.map((l) => ({ price: l.product.price, qty: l.qty })),
    coupons,
    cart.shipping?.price ?? null,
    bugs,
  );
  const count = cart.items.reduce((sum, i) => sum + i.qty, 0);

  /** Retorna false quando não há estoque suficiente. */
  function add(productId: number) {
    const product = findProduct(productId);
    if (!product) return false;
    const current = cart.items.find((i) => i.productId === productId)?.qty ?? 0;
    if (current + 1 > product.stock) return false;
    setCart((c) => ({
      ...c,
      items: current ? c.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i)) : [...c.items, { productId, qty: 1 }],
    }));
    return true;
  }

  function setQty(productId: number, qty: number) {
    const product = findProduct(productId);
    if (!product) return;
    const clamped = Math.max(1, Math.min(qty, product.stock));
    setCart((c) => ({ ...c, items: c.items.map((i) => (i.productId === productId ? { ...i, qty: clamped } : i)) }));
  }

  function remove(productId: number) {
    setCart((c) => ({ ...c, items: c.items.filter((i) => i.productId !== productId) }));
  }

  function setCoupons(codes: string[]) {
    setCart((c) => ({ ...c, coupons: codes }));
  }

  function setShipping(quote: ShippingQuote | null) {
    setCart((c) => ({ ...c, shipping: quote }));
  }

  function clear() {
    setCart(EMPTY);
  }

  return { cart, lines, coupons, totals, count, hydrated, add, setQty, remove, setCoupons, setShipping, clear };
}
