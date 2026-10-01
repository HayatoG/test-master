"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useProducts } from "@/lib/products/useProducts";
import { ProductForm } from "../ProductForm";

export default function NovoProdutoPage() {
  const [products, setProducts, hydrated] = useProducts();
  const router = useRouter();
  const toast = useToast();

  return (
    <div>
      <PageHeader title="Novo produto" />
      {!hydrated ? (
        <Spinner />
      ) : (
        <ProductForm
          others={products}
          submitLabel="Salvar"
          onSubmit={(input) => {
            const id = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
            setProducts((all) => [...all, { id, ...input }]);
            toast(`Produto "${input.name}" criado com sucesso`);
            router.push("/produtos");
          }}
        />
      )}
    </div>
  );
}
