"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Estado persistido no localStorage, inicializado a partir de um seed.
 * `hydrated` fica false até a leitura do localStorage terminar: as telas só
 * mostram dados depois disso, evitando que um teste leia o seed por engano.
 */
export function useLocalStore<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após montar
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // valor corrompido: mantém o seed
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage indisponível: segue só em memória
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
