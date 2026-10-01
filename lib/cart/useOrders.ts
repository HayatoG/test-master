"use client";

import type { CartTotals } from "@/lib/domain/cart";
import type { ShippingQuote } from "@/lib/domain/shipping";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useLocalStore } from "@/lib/storage/useLocalStore";

export type Address = { recipient: string; cep: string; street: string; number: string; complement: string; city: string; uf: string };

export type Order = {
  id: string;
  items: { productId: number; name: string; price: number; qty: number }[];
  coupons: string[];
  shipping: ShippingQuote;
  payment: { method: "card" | "pix"; last4?: string; installments?: number };
  totals: CartTotals;
  address: Address;
};

const NO_ORDERS: Order[] = [];

export function useOrders() {
  return useLocalStore<Order[]>(STORAGE_KEYS.orders, NO_ORDERS);
}
