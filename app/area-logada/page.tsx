import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/auth/server";
import { findUser } from "@/lib/seed/users";

export const metadata: Metadata = { title: "Área logada" };

export default async function AreaLogadaPage() {
  const session = await getSession();
  const user = session && findUser(session.username);

  return (
    <div>
      <PageHeader title="Área logada" description="Esta página só pode ser acessada com uma sessão válida." />
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-lg" data-testid="welcome-message">
          Olá, {user?.name ?? session?.username}!
        </p>
        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-slate-500">Usuário</dt>
          <dd className="font-mono">{session?.username}</dd>
          <dt className="text-slate-500">Perfil</dt>
          <dd>{session?.role === "admin" ? "Administrador" : "Usuário"}</dd>
        </dl>
        <ul className="mt-6 flex flex-wrap gap-4 text-sm">
          <li>
            <Link href="/admin" className="text-brand-700 underline">
              Painel administrativo
            </Link>
          </li>
          <li>
            <Link href="/produtos" className="text-brand-700 underline">
              Gerenciar produtos
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
