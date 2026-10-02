import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContextMenuArea, DoubleClickEdit, HoverMenu, KeyboardPlayground, Kanban, Sliders, SortableList, TooltipDemo } from "./widgets";

export const metadata: Metadata = { title: "Interações avançadas" };

export default function InteracoesPage() {
  return (
    <div>
      <PageHeader
        title="Interações avançadas"
        difficulty="difícil"
        description="Drag-and-drop, hover, clique direito, atalhos de teclado, sliders e duplo clique. A ordem do Kanban e da lista fica salva no navegador."
      />
      <div className="grid gap-6">
        <Kanban />
        <div className="grid gap-6 xl:grid-cols-2">
          <SortableList />
          <div className="grid gap-6">
            <TooltipDemo />
            <HoverMenu />
          </div>
          <ContextMenuArea />
          <DoubleClickEdit />
          <KeyboardPlayground />
          <Sliders />
        </div>
      </div>
    </div>
  );
}
