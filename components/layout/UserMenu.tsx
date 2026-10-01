"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth/session";

export function UserMenu({ session }: { session: SessionPayload | null }) {
  const router = useRouter();

  if (!session) {
    return (
      <Link href="/login" className="text-sm text-slate-100 underline-offset-4 hover:underline">
        Entrar
      </Link>
    );
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?logout=1");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm text-slate-100">
      <span data-testid="current-user">
        Logado como <strong>{session.username}</strong>
      </span>
      <button type="button" onClick={logout} className="rounded-md bg-slate-700 px-3 py-1.5 hover:bg-slate-600">
        Sair
      </button>
    </div>
  );
}
