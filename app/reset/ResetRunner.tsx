"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAppStorage } from "@/lib/storage/keys";

/**
 * Limpa localStorage (chaves qap:*), sessionStorage, sessão e Modo Bugs.
 * Com ?next=/caminho redireciona ao terminar — útil em beforeEach.
 */
export function ResetRunner() {
  const params = useSearchParams();
  const next = params.get("next");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      clearAppStorage();
      await fetch("/api/reset", { method: "POST" });
      if (cancelled) return;
      // Só aceita caminhos internos para evitar open redirect.
      if (next && next.startsWith("/") && !next.startsWith("//") && next !== "/reset") {
        window.location.replace(next);
      } else {
        setDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next]);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
      <h1 className="text-xl font-semibold">Reset do estado</h1>
      <p role="status" className="mt-3 text-slate-700">
        {done ? "Estado inicial restaurado." : "Restaurando estado inicial…"}
      </p>
      {done && (
        <Link href="/" className="mt-4 inline-block text-brand-700 underline">
          Voltar ao início
        </Link>
      )}
    </div>
  );
}
