import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/auth/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const next = typeof params.next === "string" ? params.next : undefined;
  const loggedOut = params.logout === "1";

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Login" difficulty="fácil" description="Entre com um dos usuários de teste listados na página inicial." />
      {loggedOut && !session && (
        <p role="status" className="mb-4 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm">
          Você saiu da sua conta.
        </p>
      )}
      {next && !session && (
        <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Faça login para acessar esta página.
        </p>
      )}
      {session ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p>
            Você já está logado como <strong>{session.username}</strong>.
          </p>
          <Link href="/area-logada" className="mt-3 inline-block text-brand-700 underline">
            Ir para a área logada
          </Link>
        </div>
      ) : (
        <LoginForm next={next} />
      )}
    </div>
  );
}
