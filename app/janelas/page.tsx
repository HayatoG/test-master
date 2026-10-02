import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { NativeDialogs, NewWindows, ShadowDomDemo } from "./widgets";

export const metadata: Metadata = { title: "Janelas e frames" };

export default function JanelasPage() {
  return (
    <div>
      <PageHeader
        title="Janelas e frames"
        difficulty="difícil"
        description="Diálogos nativos do navegador, novas abas e popups, iframes (inclusive aninhados) e Shadow DOM."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <NativeDialogs />
        <NewWindows />
        <Section id="iframe" title="Iframe" description="Um formulário carregado dentro de um iframe. Use frameLocator().">
          <iframe title="Formulário no iframe" src="/janelas/frames/conteudo" className="h-48 w-full rounded-md border border-slate-200" />
        </Section>
        <Section id="iframe-aninhado" title="Iframe aninhado" description="Um iframe dentro de outro iframe.">
          <iframe title="Iframe externo" src="/janelas/frames/aninhado" className="h-72 w-full rounded-md border border-slate-200" />
        </Section>
        <ShadowDomDemo />
      </div>
    </div>
  );
}
