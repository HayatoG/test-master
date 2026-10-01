"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "Erro inesperado");
      return;
    }
    // Navegação completa de propósito: descarta o cache do router com a sessão antiga.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/area-logada");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="nova-senha" className={labelClass}>
          Nova senha
        </label>
        <input id="nova-senha" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label htmlFor="confirmar-nova-senha" className={labelClass}>
          Confirmar nova senha
        </label>
        <input id="confirmar-nova-senha" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputClass} mt-1`} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
