import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Nova aba" };

export default async function NovaAbaPage({ searchParams }: PageProps<"/janelas/nova-aba">) {
  const { origem } = await searchParams;
  const isPopup = origem === "popup";
  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
      <h1 className="text-xl font-semibold">{isPopup ? "Você está no popup" : "Você está na nova aba"}</h1>
      <p className="mt-2 text-slate-600">Esta página foi aberta {isPopup ? "por window.open()" : "por um link com target=\"_blank\""}.</p>
      <Link href="/janelas" className="mt-4 inline-block text-brand-700 underline">
        Voltar para Janelas e frames
      </Link>
    </div>
  );
}
