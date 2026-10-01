"use client";

import { PRODUCTS, type Product } from "@/lib/seed/products";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useLocalStore } from "@/lib/storage/useLocalStore";

/** Produtos do CRUD: começam no seed e persistem no localStorage. */
export function useProducts() {
  return useLocalStore<Product[]>(STORAGE_KEYS.products, PRODUCTS as Product[]);
}
