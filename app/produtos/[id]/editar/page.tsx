"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { useProducts } from "@/lib/products/useProducts";
import { ProductForm } from "../../ProductForm";

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts, hydrated] = useProducts();
  const { enabled: bugs } = useBugs();
  const router = useRouter();
  const toast = useToast();
  const product = products.find((p) => p.id === Number(id));

  return (
    <div>
      <PageHeader title="Editar produto" />
      {!hydrated ? (
        <Spinner />
      ) : !product ? (
        <div role="alert" className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="font-medium">Produto não encontrado</p>
          <Link href="/produtos" className="mt-2 inline-block text-brand-700 underline">
            Voltar para a lista
          </Link>
        </div>
      ) : (
        <ProductForm
          initial={product}
          others={products.filter((p) => p.id !== product.id)}
          submitLabel="Salvar alterações"
          onSubmit={(input) => {
            setProducts((all) => {
              const index = all.findIndex((p) => p.id === product.id);
              // B08: com bug, as alterações vão para o produto anterior da lista.
              const target = bugs ? (index - 1 + all.length) % all.length : index;
              return all.map((p, i) => (i === target ? { ...p, ...input } : p));
            });
            toast(`Produto "${input.name}" atualizado com sucesso`);
            router.push("/produtos");
          }}
        />
      )}
    </div>
  );
}
