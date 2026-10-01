import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/auth/server";
import { USERS } from "@/lib/seed/users";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();

  if (session?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-white p-6 text-center">
        <p className="font-mono text-5xl font-bold text-red-600">403</p>
        <h1 className="mt-2 text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-slate-600">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Painel administrativo" description="Visível apenas para o perfil admin." />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="px-4 py-3 text-left font-semibold">Usuários cadastrados</caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-2">ID</th>
              <th scope="col" className="px-4 py-2">Usuário</th>
              <th scope="col" className="px-4 py-2">Nome</th>
              <th scope="col" className="px-4 py-2">E-mail</th>
              <th scope="col" className="px-4 py-2">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2 font-mono">{u.username}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
