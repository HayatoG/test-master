"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { BUGS_COOKIE } from "@/lib/auth/constants";
import type { BugKey } from "./registry";

type BugsContextValue = {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  isBugOn: (key: BugKey) => boolean;
};

const BugsContext = createContext<BugsContextValue | null>(null);

export function BugsProvider({ initialEnabled, children }: { initialEnabled: boolean; children: React.ReactNode }) {
  const [enabled, setState] = useState(initialEnabled);
  // Sincroniza quando o servidor muda o cookie (ex.: navegação com ?bugs=on).
  const [prevInitial, setPrevInitial] = useState(initialEnabled);
  if (prevInitial !== initialEnabled) {
    setPrevInitial(initialEnabled);
    setState(initialEnabled);
  }
  const router = useRouter();

  const setEnabled = useCallback(
    (on: boolean) => {
      document.cookie = `${BUGS_COOKIE}=${on ? "on" : "off"}; path=/; SameSite=Lax`;
      setState(on);
      router.refresh();
    },
    [router],
  );

  // Todos os bugs são ativados juntos; a chave serve para rastrear no gabarito.
  const isBugOn = useCallback((key: BugKey) => enabled && Boolean(key), [enabled]);

  return <BugsContext.Provider value={{ enabled, setEnabled, isBugOn }}>{children}</BugsContext.Provider>;
}

export function useBugs() {
  const ctx = useContext(BugsContext);
  if (!ctx) throw new Error("useBugs precisa estar dentro de <BugsProvider>");
  return ctx;
}
