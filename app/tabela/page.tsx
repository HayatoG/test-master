import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "./DataTable";

export const metadata: Metadata = { title: "Tabela de dados" };

export default function TabelaPage() {
  return (
    <div>
      <PageHeader
        title="Tabela de dados"
        difficulty="médio"
        description="Os dados vêm de GET /api/table-rows. Os filtros ficam na URL, então dá para abrir a página já filtrada."
      />
      <Suspense>
        <DataTable />
      </Suspense>
    </div>
  );
}
