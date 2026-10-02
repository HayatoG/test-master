"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Spinner } from "@/components/ui/Spinner";
import { useBugs } from "@/lib/bugs/BugsProvider";

/** Conteúdo que aparece 2s depois de a página carregar. */
export function DelayedContent() {
  const [loaded, setLoaded] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(t);
  }, [round]);

  return (
    <Section id="atraso" title="Conteúdo com atraso" description="Carrega 2 segundos depois de abrir a página.">
      {loaded ? (
        <p data-testid="delayed-content" className="rounded-md bg-emerald-50 p-3 text-emerald-900">
          Conteúdo carregado com sucesso
        </p>
      ) : (
        <div aria-hidden="true" data-testid="skeleton" className="h-12 animate-pulse rounded-md bg-slate-200" />
      )}
      <Button
        variant="secondary"
        className="mt-3"
        onClick={() => {
          setLoaded(false);
          setRound((r) => r + 1);
        }}
      >
        Recarregar conteúdo
      </Button>
    </Section>
  );
}

/** Busca dados de uma API lenta (GET /api/slow?ms=1500). */
export function LoadDataButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function load() {
    setState("loading");
    try {
      const res = await fetch("/api/slow?ms=1500");
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <Section id="carregar" title="Carregar dados" description="Chama GET /api/slow?ms=1500. Bom para praticar waitForResponse e page.route.">
      <Button onClick={load} disabled={state === "loading"}>
        Carregar dados
      </Button>
      <div className="mt-3 min-h-16">
        {state === "loading" && <Spinner label="Carregando dados" />}
        {state === "error" && (
          <p role="alert" className="text-red-700">
            Erro ao carregar os dados
          </p>
        )}
        {state === "done" && (
          <ul aria-label="Dados carregados" className="list-disc pl-5 text-sm">
            <li>Relatório de vendas</li>
            <li>Relatório de estoque</li>
            <li>Relatório de clientes</li>
          </ul>
        )}
      </div>
    </Section>
  );
}

/** Botão que só habilita 5s depois de iniciar a contagem. */
export function CountdownButton() {
  const { enabled: bugs } = useBugs();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining > 0) {
      const t = setTimeout(() => setRemaining(remaining - 1), 1000);
      return () => clearTimeout(t);
    }
    // B15: com bug, o botão só habilita 2s depois de a contagem chegar a zero.
    const t = setTimeout(() => setEnabled(true), bugs ? 2000 : 0);
    return () => clearTimeout(t);
  }, [remaining, bugs]);

  return (
    <Section id="contagem" title="Botão habilitado após 5 segundos" description="Inicie a contagem; o botão Confirmar habilita quando ela chega a zero.">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setEnabled(false);
            setConfirmed(false);
            setRemaining(5);
          }}
        >
          Iniciar contagem
        </Button>
        <Button disabled={!enabled} onClick={() => setConfirmed(true)}>
          Confirmar
        </Button>
        <span data-testid="countdown" aria-live="polite" className="font-mono text-sm">
          {remaining === null ? "" : remaining > 0 ? `Aguarde ${remaining}s` : "Pronto!"}
        </span>
      </div>
      {confirmed && (
        <p role="status" className="mt-3 text-emerald-800">
          Ação confirmada
        </p>
      )}
    </Section>
  );
}

/** Notificação que some sozinha e painel expansível. */
export function DisappearingElements() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function show() {
    clearTimeout(timer.current);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 3000);
  }

  return (
    <Section id="aparece-some" title="Aparece e some" description="A notificação desaparece sozinha em 3 segundos.">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={show}>
          Mostrar notificação
        </Button>
        <Button variant="secondary" aria-expanded={expanded} aria-controls="painel-detalhes" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Ocultar detalhes" : "Mostrar detalhes"}
        </Button>
      </div>
      {visible && (
        <p role="alert" className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Notificação temporária: some em 3 segundos
        </p>
      )}
      <div id="painel-detalhes" hidden={!expanded} className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
        Detalhes adicionais que ficam ocultos até o botão ser clicado.
      </div>
    </Section>
  );
}

/** Texto que muda de "Processando…" para "Concluído". */
export function StatusText() {
  const [status, setStatus] = useState("Aguardando");

  function run() {
    setStatus("Processando…");
    setTimeout(() => setStatus("Concluído"), 2500);
  }

  return (
    <Section id="status" title="Texto que muda" description="O status passa por Processando… antes de chegar a Concluído (2,5 s).">
      <Button variant="secondary" onClick={run} disabled={status === "Processando…"}>
        Processar
      </Button>
      <p className="mt-3 text-sm">
        Status:{" "}
        <strong role="status" data-testid="process-status">
          {status}
        </strong>
      </p>
    </Section>
  );
}

/** Barra de progresso que avança 10% a cada 300ms. */
export function ProgressDownload() {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = setTimeout(() => setProgress(progress + 10), 300);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <Section id="progresso" title="Barra de progresso" description="Avança 10% a cada 300 ms.">
      <Button variant="secondary" onClick={() => setProgress(0)} disabled={progress !== null && progress < 100}>
        Iniciar download
      </Button>
      {progress !== null && (
        <div className="mt-3">
          <div role="progressbar" aria-label="Progresso do download" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm" aria-live="polite">
            {progress >= 100 ? "Download concluído" : `${progress}%`}
          </p>
        </div>
      )}
    </Section>
  );
}

/** Diferença entre elemento oculto (continua no DOM) e removido do DOM. */
export function RemovedVsHidden() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  return (
    <Section id="oculto-removido" title="Oculto × removido" description="Um elemento fica no DOM com display:none; o outro é removido. Compare toBeHidden e toBeAttached.">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setHidden((h) => !h)}>
          {hidden ? "Exibir caixa azul" : "Ocultar caixa azul"}
        </Button>
        <Button variant="secondary" onClick={() => setRemoved((r) => !r)}>
          {removed ? "Recriar caixa verde" : "Remover caixa verde"}
        </Button>
      </div>
      <div className="mt-3 flex gap-3">
        <div data-testid="blue-box" style={{ display: hidden ? "none" : undefined }} className="rounded-md bg-sky-100 p-3 text-sm text-sky-900">
          Caixa azul
        </div>
        {!removed && (
          <div data-testid="green-box" className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-900">
            Caixa verde
          </div>
        )}
      </div>
    </Section>
  );
}

const TOTAL_ITEMS = 100;
const PAGE = 20;

/** Lista que carrega mais 20 itens (com 800ms de atraso) ao rolar até o fim. */
export function InfiniteScroll() {
  const [count, setCount] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || count >= TOTAL_ITEMS) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          setTimeout(() => {
            setCount((c) => Math.min(c + PAGE, TOTAL_ITEMS));
            setLoading(false);
          }, 800);
        }
      },
      { root: container.current },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, loading]);

  return (
    <Section id="scroll-infinito" title="Scroll infinito" description="Role a lista para carregar mais itens, 20 por vez, até 100.">
      <p className="mb-2 text-sm text-slate-600" data-testid="infinite-count" aria-live="polite">
        {count} de {TOTAL_ITEMS} itens
      </p>
      <div ref={container} className="h-64 overflow-y-auto rounded-md border border-slate-200">
        <ul aria-label="Itens carregados" className="divide-y divide-slate-100 text-sm">
          {Array.from({ length: count }, (_, i) => (
            <li key={i} className="px-3 py-2">
              Item {i + 1}
            </li>
          ))}
        </ul>
        {count < TOTAL_ITEMS ? (
          <div ref={sentinel} className="border-t border-slate-100 px-3 py-3">
            {loading ? <Spinner label="Carregando mais itens" /> : <span className="text-sm text-slate-400">Role para carregar mais</span>}
          </div>
        ) : (
          <p className="border-t border-slate-100 px-3 py-3 text-center text-sm font-medium text-slate-600">Fim da lista</p>
        )}
      </div>
    </Section>
  );
}
