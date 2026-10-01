"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatBRL } from "@/lib/domain/money";
import { useProducts } from "@/lib/products/useProducts";
import type { Product } from "@/lib/seed/products";

export default function ProdutosPage() {
  const [products, setProducts, hydrated] = useProducts();
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const toast = useToast();

  function confirmDelete() {
    if (!toDelete) return;
    setProducts((all) => all.filter((p) => p.id !== toDelete.id));
    toast(`Produto "${toDelete.name}" excluído`);
    setToDelete(null);
  }

  return (
    <div>
      <PageHeader title="Produtos" difficulty="médio" description="CRUD completo. Os dados ficam no localStorage e voltam ao seed com o reset." />
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600" data-testid="product-count">
          {hydrated ? `${products.length} ${products.length === 1 ? "produto" : "produtos"}` : ""}
        </p>
        <Link href="/produtos/novo" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Novo produto
        </Link>
      </div>

      {!hydrated ? (
        <Spinner label="Carregando produtos" />
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium">Nenhum produto cadastrado</p>
          <p className="mt-1 text-sm text-slate-600">Cadastre um produto ou use o reset para restaurar os dados iniciais.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Produtos cadastrados</caption>
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-2">Nome</th>
                <th scope="col" className="px-4 py-2">SKU</th>
                <th scope="col" className="px-4 py-2">Categoria</th>
                <th scope="col" className="px-4 py-2 text-right">Preço</th>
                <th scope="col" className="px-4 py-2 text-right">Estoque</th>
                <th scope="col" className="px-4 py-2">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <th scope="row" className="px-4 py-2 font-medium">
                    {p.name}
                  </th>
                  <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-2">{p.category}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatBRL(p.price)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.stock === 0 ? <span className="text-red-700">Esgotado</span> : p.stock}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <Link href={`/produtos/${p.id}/editar`} className="rounded-md px-3 py-1.5 text-brand-700 hover:bg-brand-50">
                        Editar
                      </Link>
                      <Button variant="ghost" className="text-red-700" onClick={() => setToDelete(p)}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Excluir produto"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Excluir
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir <strong>{toDelete?.name}</strong>? Esta ação não pode ser desfeita.
      </Modal>
    </div>
  );
}
