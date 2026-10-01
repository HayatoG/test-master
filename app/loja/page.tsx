import type { Metadata } from "next";
import { CartLink } from "@/components/CartLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PRODUCTS } from "@/lib/seed/products";
import { AddToCartButton } from "./AddToCartButton";
import { formatBRL } from "@/lib/domain/money";

export const metadata: Metadata = { title: "Loja" };

export default function LojaPage() {
  return (
    <div>
      <PageHeader
        title="Loja"
        difficulty="difícil"
        description="Adicione produtos, aplique cupons e finalize a compra. O checkout exige login. Frete grátis a partir de R$ 200,00."
      />
      <div className="mb-4 flex justify-end">
        <CartLink />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((p) => (
          <li key={p.id}>
            <article aria-labelledby={`produto-${p.id}`} className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs tracking-wide text-slate-500 uppercase">{p.category}</p>
              <h2 id={`produto-${p.id}`} className="mt-1 font-semibold">
                {p.name}
              </h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{p.description}</p>
              <p className="mt-3 text-lg font-semibold tabular-nums">{formatBRL(p.price)}</p>
              <p className={`text-xs ${p.stock === 0 ? "text-red-700" : "text-slate-500"}`}>{p.stock === 0 ? "Esgotado" : `${p.stock} em estoque`}</p>
              <AddToCartButton productId={p.id} productName={p.name} disabled={p.stock === 0} />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
