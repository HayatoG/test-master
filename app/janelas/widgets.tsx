"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function NativeDialogs() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <Section id="dialogos" title="Diálogos nativos" description="alert, confirm e prompt bloqueiam a página até serem respondidos. Use page.on('dialog').">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            alert("Este é um alert do QA Playground");
            setResult("alert fechado");
          }}
        >
          Abrir alert
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const ok = confirm("Deseja continuar?");
            setResult(ok ? "confirm aceito" : "confirm cancelado");
          }}
        >
          Abrir confirm
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const name = prompt("Qual é o seu nome?", "Visitante");
            setResult(name === null ? "prompt cancelado" : `prompt respondido: ${name}`);
          }}
        >
          Abrir prompt
        </Button>
      </div>
      <p role="status" data-testid="dialog-result" className="mt-3 text-sm">
        {result ? `Resultado: ${result}` : "Nenhum diálogo aberto ainda"}
      </p>
    </Section>
  );
}

export function NewWindows() {
  return (
    <Section id="novas-janelas" title="Nova aba e popup" description="Capture a nova página com context.waitForEvent('page') ou page.waitForEvent('popup').">
      <div className="flex flex-wrap items-center gap-3">
        <a href="/janelas/nova-aba" target="_blank" rel="noopener" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Abrir em nova aba
        </a>
        <Button variant="secondary" onClick={() => window.open("/janelas/nova-aba?origem=popup", "qa-popup", "width=520,height=420")}>
          Abrir popup
        </Button>
      </div>
    </Section>
  );
}

/**
 * Registra os custom elements com Shadow DOM aberto. O Playwright atravessa
 * shadow roots abertos automaticamente com getByRole, getByLabel etc.
 */
function defineShadowElements() {
  if (customElements.get("qa-shadow-form")) return;

  class QaShadowForm extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>
          :host { display: block; font-family: inherit; }
          .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          label { display: block; font-size: 14px; font-weight: 500; }
          input { margin-top: 4px; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; width: 100%; box-sizing: border-box; }
          button { margin-top: 8px; padding: 6px 12px; border-radius: 6px; border: 0; background: #059669; color: white; cursor: pointer; }
          p { font-size: 14px; margin: 8px 0 0; }
        </style>
        <div class="box">
          <strong>Componente com Shadow DOM</strong>
          <form>
            <label for="nome-shadow">Nome no Shadow DOM</label>
            <input id="nome-shadow" />
            <button type="submit">Enviar do Shadow DOM</button>
          </form>
          <p role="status" id="saida"></p>
        </div>`;
      root.querySelector("form")!.addEventListener("submit", (e) => {
        e.preventDefault();
        const value = (root.querySelector("#nome-shadow") as HTMLInputElement).value;
        root.querySelector("#saida")!.textContent = `Olá, ${value || "anônimo"}!`;
      });
    }
  }

  class QaShadowInner extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: "open" });
      let count = 0;
      root.innerHTML = `<button type="button" style="padding:6px 12px">Botão aninhado</button> <span data-testid="nested-count">Cliques: 0</span>`;
      root.querySelector("button")!.addEventListener("click", () => {
        count++;
        root.querySelector("span")!.textContent = `Cliques: ${count}`;
      });
    }
  }

  class QaShadowOuter extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<div style="border:1px dashed #94a3b8;border-radius:8px;padding:12px"><p style="margin:0 0 8px;font-size:14px">Shadow root externo</p><qa-shadow-inner></qa-shadow-inner></div>`;
    }
  }

  customElements.define("qa-shadow-form", QaShadowForm);
  customElements.define("qa-shadow-inner", QaShadowInner);
  customElements.define("qa-shadow-outer", QaShadowOuter);
}

export function ShadowDomDemo() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    defineShadowElements();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só renderiza os elementos depois de registrá-los
    setReady(true);
  }, []);

  return (
    <Section id="shadow-dom" title="Shadow DOM" description="Um formulário dentro de um shadow root e um botão dentro de dois shadow roots aninhados.">
      {ready && (
        <div className="space-y-4">
          <qa-shadow-form />
          <qa-shadow-outer />
        </div>
      )}
    </Section>
  );
}
