import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CountdownButton,
  DelayedContent,
  DisappearingElements,
  InfiniteScroll,
  LoadDataButton,
  ProgressDownload,
  RemovedVsHidden,
  StatusText,
} from "./widgets";

export const metadata: Metadata = { title: "Elementos dinâmicos" };

export default function DinamicosPage() {
  return (
    <div>
      <PageHeader
        title="Elementos dinâmicos e esperas"
        difficulty="médio"
        description="Tudo aqui depende de tempo ou de rede. Evite waitForTimeout: use as esperas automáticas do Playwright, expect com timeout, expect.poll ou page.clock."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <DelayedContent />
        <LoadDataButton />
        <CountdownButton />
        <DisappearingElements />
        <StatusText />
        <ProgressDownload />
        <RemovedVsHidden />
        <InfiniteScroll />
      </div>
    </div>
  );
}
