"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, inputClass, labelClass } from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { STORAGE_KEYS } from "@/lib/storage/keys";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/area-logada";
}

export function LoginForm({ next }: { next?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // "Lembrar-me" também preenche o último usuário usado.
  useEffect(() => {
    const last = localStorage.getItem(STORAGE_KEYS.lastUsername);
    if (last) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após montar
      setUsername(last);
      setRemember(true);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errors = {
      username: username.trim() ? undefined : "Informe o usuário",
      password: password ? undefined : "Informe a senha",
    };
    setFieldErrors(errors);
    if (errors.username || errors.password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Erro inesperado");
        setLoading(false);
        return;
      }
      if (remember) localStorage.setItem(STORAGE_KEYS.lastUsername, username.trim());
      else localStorage.removeItem(STORAGE_KEYS.lastUsername);
      // Navegação completa: descarta o cache do router (que pode ter guardado o
      // redirect para /login de uma página protegida acessada antes).
      window.location.assign(data.redirectTo ?? safeNext(next));
    } catch {
      setError("Falha de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Login" className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div role="alert" data-testid="login-error" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="username" className={labelClass}>
          Usuário
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-invalid={!!fieldErrors.username}
          aria-describedby={fieldErrors.username ? "username-erro" : undefined}
          className={`${inputClass} mt-1`}
        />
        <FieldError id="username-erro" message={fieldErrors.username} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-erro" : undefined}
            className={inputClass}
          />
          <Button variant="secondary" aria-pressed={showPassword} onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? "Ocultar" : "Mostrar"}
            <span className="sr-only"> senha</span>
          </Button>
        </div>
        <FieldError id="password-erro" message={fieldErrors.password} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
        Lembrar-me
      </label>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
      {loading && <Spinner label="Validando credenciais" />}
    </form>
  );
}
