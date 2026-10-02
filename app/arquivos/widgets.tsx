"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { Section } from "@/components/ui/Section";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { ACCEPT_ATTR, formatBytes, MAX_FILES, toCsv, validateUpload } from "@/lib/domain/files";
import { PRODUCTS } from "@/lib/seed/products";

const fileInputClass = "mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200";

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------------------------------------------------- Upload simples */

export function SingleUpload() {
  const { enabled: bugs } = useBugs();
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sha, setSha] = useState<string | null>(null);

  useEffect(() => {
    if (!file || problem || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL de preview depende do arquivo escolhido
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [file, problem]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setStatus("idle");
    setSha(null);
    setProblem(f ? validateUpload(f, bugs) : null);
  }

  async function send() {
    if (!file) return;
    setStatus("sending");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setProblem(data.error?.message ?? "Falha no envio");
      return;
    }
    setSha(data.sha256);
    setStatus("sent");
  }

  return (
    <Section id="upload-simples" title="Upload simples" description="Valida tipo e tamanho ao escolher o arquivo e envia para POST /api/upload.">
      <label htmlFor="arquivo" className={labelClass}>
        Selecionar arquivo
      </label>
      <input id="arquivo" type="file" accept={ACCEPT_ATTR} onChange={onChange} aria-invalid={!!problem} aria-describedby={problem ? "arquivo-erro" : undefined} className={fileInputClass} />
      {problem && (
        <p id="arquivo-erro" role="alert" data-testid="upload-error" className="mt-2 text-sm text-red-700">
          {problem}
        </p>
      )}
      {file && !problem && (
        <div className="mt-4 rounded-md border border-slate-200 p-3" data-testid="file-card">
          <p className="text-sm">
            <strong>{file.name}</strong> — {formatBytes(file.size)}
          </p>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL local
            <img src={preview} alt={`Pré-visualização de ${file.name}`} className="mt-2 max-h-32 rounded" />
          )}
          <Button className="mt-3" onClick={send} disabled={status === "sending" || status === "sent"}>
            {status === "sending" ? "Enviando…" : "Enviar arquivo"}
          </Button>
        </div>
      )}
      {status === "sent" && (
        <div role="status" className="mt-3 text-sm text-emerald-800">
          <p>Arquivo enviado com sucesso</p>
          <p className="font-mono text-xs break-all" data-testid="upload-sha">
            SHA-256: {sha}
          </p>
        </div>
      )}
    </Section>
  );
}

/* --------------------------------------------------------- Upload múltiplo */

type Picked = { id: number; name: string; size: number; problem: string | null };

function usePickedFiles() {
  const { enabled: bugs } = useBugs();
  const [files, setFiles] = useState<Picked[]>([]);
  const [limitError, setLimitError] = useState<string | null>(null);

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const room = Math.max(MAX_FILES - files.length, 0);
    setLimitError(incoming.length > room ? `Máximo de ${MAX_FILES} arquivos. ${incoming.length - room} arquivo(s) ignorado(s).` : null);
    const nextId = files.reduce((m, f) => Math.max(m, f.id), 0) + 1;
    setFiles([...files, ...incoming.slice(0, room).map((f, i) => ({ id: nextId + i, name: f.name, size: f.size, problem: validateUpload(f, bugs) }))]);
  }

  const remove = (id: number) => setFiles((fs) => fs.filter((f) => f.id !== id));
  return { files, addFiles, remove, limitError };
}

function PickedList({ files, onRemove, label }: { files: Picked[]; onRemove: (id: number) => void; label: string }) {
  if (files.length === 0) return null;
  return (
    <ul aria-label={label} className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200 text-sm">
      {files.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <span>
            <span className="font-medium">{f.name}</span> <span className="text-slate-500">({formatBytes(f.size)})</span>
            <span className={`ml-2 text-xs ${f.problem ? "text-red-700" : "text-emerald-700"}`}>{f.problem ?? "válido"}</span>
          </span>
          <Button variant="ghost" className="px-2 py-1 text-red-700" onClick={() => onRemove(f.id)}>
            Remover<span className="sr-only"> {f.name}</span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function MultiUpload() {
  const { files, addFiles, remove, limitError } = usePickedFiles();
  return (
    <Section id="upload-multiplo" title="Upload múltiplo" description={`Até ${MAX_FILES} arquivos. Cada um é validado separadamente.`}>
      <label htmlFor="arquivos-multiplos" className={labelClass}>
        Selecionar vários arquivos
      </label>
      <input
        id="arquivos-multiplos"
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
        className={fileInputClass}
      />
      {limitError && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {limitError}
        </p>
      )}
      <p className="mt-2 text-sm text-slate-600" data-testid="multi-count">
        {files.length} {files.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}
      </p>
      <PickedList files={files} onRemove={remove} label="Arquivos selecionados" />
    </Section>
  );
}

/* ------------------------------------------------------------- Drop zone */

export function DropZone() {
  const { files, addFiles, remove, limitError } = usePickedFiles();
  const [over, setOver] = useState(false);
  return (
    <Section id="arrastar-arquivos" title="Arrastar e soltar arquivos" description="Solte arquivos na área ou clique para escolher.">
      <div
        data-testid="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed text-sm ${over ? "border-brand-500 bg-brand-50" : "border-slate-300 text-slate-600"}`}
      >
        <p>Arraste arquivos para esta área</p>
        <label className="mt-1 cursor-pointer text-brand-700 underline">
          ou clique para escolher
          <input type="file" multiple className="sr-only" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </label>
      </div>
      {limitError && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {limitError}
        </p>
      )}
      <PickedList files={files} onRemove={remove} label="Arquivos soltos" />
    </Section>
  );
}

/* --------------------------------------------------------------- Downloads */

export function Downloads() {
  const [text, setText] = useState("Anotações de teste do QA Playground");

  function productsCsv() {
    const csv = toCsv([["id", "nome", "sku", "categoria", "preco", "estoque"], ...PRODUCTS.map((p) => [p.id, p.name, p.sku, p.category, p.price, p.stock])]);
    downloadBlob(csv, "produtos.csv", "text/csv;charset=utf-8");
  }

  return (
    <Section id="downloads" title="Downloads" description="Arquivos gerados no navegador (Blob) e no servidor (Content-Disposition). Use page.waitForEvent('download').">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={productsCsv}>
          Baixar CSV de produtos
        </Button>
        <a href="/api/export?format=csv" download className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Baixar relatório CSV
        </a>
        <a href="/api/export?format=json" download className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Baixar relatório JSON
        </a>
      </div>
      <div className="mt-5">
        <label htmlFor="conteudo-txt" className={labelClass}>
          Conteúdo do arquivo
        </label>
        <textarea id="conteudo-txt" rows={3} value={text} onChange={(e) => setText(e.target.value)} className={`${inputClass} mt-1`} />
        <Button variant="secondary" className="mt-2" onClick={() => downloadBlob(text, "nota.txt", "text/plain;charset=utf-8")}>
          Baixar como .txt
        </Button>
      </div>
    </Section>
  );
}
