"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Estado persistido no localStorage, inicializado a partir de um seed.
 * `hydrated` fica false até a leitura do localStorage terminar: as telas só
 * mostram dados depois disso, evitando que um teste leia o seed por engano.
 */
export function useLocalStore<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef<T>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        latest.current = JSON.parse(raw) as T;
        setValue(latest.current);
      }
    } catch {
      // valor corrompido: mantém o seed
    }
    setHydrated(true);
  }, [key]);

  // Grava no localStorage na hora (e não dentro do updater do React), para que
  // uma navegação logo em seguida já encontre o valor novo.
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(latest.current) : next;
      latest.current = resolved;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage indisponível: segue só em memória
      }
      setValue(resolved);
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
