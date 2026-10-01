"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * Store mínima sobre o localStorage: todas as instâncias do hook que usam a
 * mesma chave ficam sincronizadas (ex.: botão "Adicionar" e badge do carrinho).
 */
const cache = new Map<string, { raw: string | null; value: unknown }>();
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, seed: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // storage indisponível
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = seed;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      // valor corrompido: usa o seed
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    localStorage.setItem(key, raw);
  } catch {
    // storage indisponível: segue só em memória
  }
  cache.set(key, { raw, value });
  listeners.get(key)?.forEach((l) => l());
}

function subscribe(key: string, listener: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  const onStorage = (e: StorageEvent) => e.key === key && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/**
 * Estado persistido no localStorage, inicializado a partir de um seed
 * (o seed deve ser uma referência estável, ex.: constante de módulo).
 * `hydrated` fica false no HTML do servidor e na hidratação; as telas só
 * mostram dados depois disso, evitando que um teste leia o seed por engano.
 */
export function useLocalStore<T>(key: string, seed: T) {
  const value = useSyncExternalStore(
    useCallback((l: () => void) => subscribe(key, l), [key]),
    () => read(key, seed),
    () => seed,
  );
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(read(key, seed)) : next;
      write(key, resolved);
    },
    [key, seed],
  );

  return [value, update, hydrated] as const;
}
