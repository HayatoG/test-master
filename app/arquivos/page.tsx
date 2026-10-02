import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Downloads, DropZone, MultiUpload, SingleUpload } from "./widgets";

export const metadata: Metadata = { title: "Upload e download" };

export default function ArquivosPage() {
  return (
    <div>
      <PageHeader
        title="Upload e download"
        difficulty="médio"
        description="Aceita PNG, JPG, PDF e CSV de até 1 MB (1.048.576 bytes). Há arquivos de exemplo em tests/files."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <SingleUpload />
        <MultiUpload />
        <DropZone />
        <Downloads />
      </div>
    </div>
  );
}
