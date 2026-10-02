"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatBRL, formatDateBR } from "@/lib/domain/money";
import { PAGE_SIZES, type SortKey, type TablePage } from "@/lib/domain/table-query";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "ID" },
  { key: "customer", label: "Cliente" },
  { key: "email", label: "E-mail" },
  { key: "city", label: "Cidade" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Valor", align: "right" },
  { key: "createdAt", label: "Data" },
];

const STATUS_STYLE: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-800",
  pendente: "bg-amber-100 text-amber-800",
  cancelado: "bg-slate-200 text-slate-700",
  arquivado: "bg-violet-100 text-violet-800",
};

type LoadState = { kind: "loading" } | { kind: "error" } | { kind: "ok"; result: TablePage };

export function DataTable() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const page = Number(params.get("page") ?? "1");
  const size = Number(params.get("size") ?? "10");
  const sort = (params.get("sort") ?? "id") as SortKey;
  const order = params.get("order") === "desc" ? "desc" : "asc";
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState(q);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [archived, setArchived] = useState<Set<number>>(new Set());

  function updateParams(changes: Record<string, string | number | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mostra o loading a cada nova busca
    setState({ kind: "loading" });
    setSelected(new Set());
    fetch(`/api/table-rows?${new URLSearchParams({ page: String(page), size: String(size), sort, order, q, status })}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        setState({ kind: "ok", result: (await res.json()) as TablePage });
      })
      .catch((err) => {
        if (err.name !== "AbortError") setState({ kind: "error" });
      });
    return () => controller.abort();
  }, [page, size, sort, order, q, status, reloadKey]);

  // Busca com debounce de 300ms.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (search !== q) updateParams({ q: search, page: null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage à digitação
  }, [search]);

  function toggleSort(key: SortKey) {
    const nextOrder = sort === key && order === "asc" ? "desc" : "asc";
    updateParams({ sort: key, order: nextOrder, page: null });
  }

  const rows = state.kind === "ok" ? state.result.data : [];
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleRow(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function archiveSelected() {
    const count = selected.size;
    setArchived((a) => new Set([...a, ...selected]));
    setSelected(new Set());
    toast(`${count} ${count === 1 ? "registro arquivado" : "registros arquivados"}`);
  }

  const result = state.kind === "ok" ? state.result : null;
  const from = result && result.total > 0 ? (result.page - 1) * result.size + 1 : 0;
  const to = result ? Math.min(result.page * result.size, result.total) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="min-w-56 flex-1">
          <label htmlFor="busca" className={labelClass}>
            Buscar
          </label>
          <input id="busca" type="search" placeholder="Nome, e-mail ou cidade" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} mt-1`} />
        </div>
        <div>
          <label htmlFor="filtro-status" className={labelClass}>
            Status
          </label>
          <select id="filtro-status" value={status} onChange={(e) => updateParams({ status: e.target.value, page: null })} className={`${inputClass} mt-1`}>
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label htmlFor="itens-por-pagina" className={labelClass}>
            Itens por página
          </label>
          <select id="itens-por-pagina" value={size} onChange={(e) => updateParams({ size: e.target.value, page: null })} className={`${inputClass} mt-1`}>
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" data-testid="table-summary" aria-live="polite">
          {result ? (result.total === 0 ? "Nenhum registro" : `Mostrando ${from}–${to} de ${result.total} registros`) : " "}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm" data-testid="selected-count">
            {selected.size} {selected.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <Button variant="secondary" disabled={selected.size === 0} onClick={archiveSelected}>
            Arquivar selecionados
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm" aria-busy={state.kind === "loading"}>
          <caption className="sr-only">Registros de clientes</caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="w-10 px-4 py-2">
                <input type="checkbox" aria-label="Selecionar todos da página" checked={allSelected} onChange={toggleAll} disabled={rows.length === 0} />
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort === c.key ? (order === "asc" ? "ascending" : "descending") : undefined}
                  className={`px-4 py-2 ${c.align === "right" ? "text-right" : ""}`}
                >
                  <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 font-medium hover:text-ink">
                    {c.label}
                    <span aria-hidden="true" className="text-xs">
                      {sort === c.key ? (order === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.kind === "loading" && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center">
                  <Spinner label="Carregando registros" />
                </td>
              </tr>
            )}
            {state.kind === "error" && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center">
                  <div role="alert" className="text-red-800">
                    Não foi possível carregar os dados.
                  </div>
                  <Button variant="secondary" className="mt-3" onClick={() => setReloadKey((k) => k + 1)}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}
            {state.kind === "ok" && rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-slate-600">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const rowStatus = archived.has(r.id) ? "arquivado" : r.status;
              return (
                <tr key={r.id} aria-selected={selected.has(r.id)} className={`border-t border-slate-100 ${selected.has(r.id) ? "bg-brand-50" : ""}`}>
                  <td className="px-4 py-2">
                    <input type="checkbox" aria-label={`Selecionar registro ${r.id}`} checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                  </td>
                  <td className="px-4 py-2 tabular-nums">{r.id}</td>
                  <td className="px-4 py-2">{r.customer}</td>
                  <td className="px-4 py-2 text-slate-600">{r.email}</td>
                  <td className="px-4 py-2">{r.city}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[rowStatus]}`}>{rowStatus}</span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatBRL(r.amount)}</td>
                  <td className="px-4 py-2 tabular-nums">{formatDateBR(r.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result && result.total > 0 && (
        <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => updateParams({ page: null })}>
            Primeira
          </Button>
          <Button variant="secondary" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}>
            Anterior
          </Button>
          <span className="px-2 text-sm" data-testid="page-indicator" aria-current="page">
            Página {result.page} de {result.totalPages}
          </span>
          <Button variant="secondary" disabled={page >= result.totalPages} onClick={() => updateParams({ page: page + 1 })}>
            Próxima
          </Button>
          <Button variant="secondary" disabled={page >= result.totalPages} onClick={() => updateParams({ page: result.totalPages })}>
            Última
          </Button>
        </nav>
      )}
    </div>
  );
}
