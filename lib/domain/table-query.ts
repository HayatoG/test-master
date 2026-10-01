import { TABLE_ROWS, type TableRow } from "@/lib/seed/table-rows";

export const SORTABLE = ["id", "customer", "email", "city", "status", "amount", "createdAt"] as const;
export type SortKey = (typeof SORTABLE)[number];
export const PAGE_SIZES = [10, 25, 50] as const;

export type TableQuery = { page: number; size: number; sort: SortKey; order: "asc" | "desc"; q: string; status: string };

export type TablePage = { data: TableRow[]; page: number; size: number; total: number; totalPages: number };

export function parseTableQuery(params: URLSearchParams): TableQuery | { error: string } {
  const page = Number(params.get("page") ?? "1");
  const size = Number(params.get("size") ?? "10");
  const sort = (params.get("sort") ?? "id") as SortKey;
  const order = params.get("order") ?? "asc";
  if (!Number.isInteger(page) || page < 1) return { error: "Parâmetro 'page' deve ser um inteiro >= 1" };
  if (!Number.isInteger(size) || size < 1 || size > 100) return { error: "Parâmetro 'size' deve ser um inteiro entre 1 e 100" };
  if (!SORTABLE.includes(sort)) return { error: `Parâmetro 'sort' deve ser um de: ${SORTABLE.join(", ")}` };
  if (order !== "asc" && order !== "desc") return { error: "Parâmetro 'order' deve ser 'asc' ou 'desc'" };
  return { page, size, sort, order, q: params.get("q")?.trim() ?? "", status: params.get("status") ?? "" };
}

export function queryTable(query: TableQuery, bugs: boolean): TablePage {
  const { page, size, sort, order, q, status } = query;
  let rows = TABLE_ROWS.slice();

  if (q) {
    // B11: com bug, a busca diferencia maiúsculas de minúsculas.
    const norm = (s: string) => (bugs ? s : s.toLowerCase());
    const needle = norm(q);
    rows = rows.filter((r) => [r.customer, r.email, r.city].some((f) => norm(f).includes(needle)));
  }
  if (status) rows = rows.filter((r) => r.status === status);

  rows.sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") {
      // B09: com bug, valores numéricos (exceto id) são comparados como texto.
      cmp = bugs && sort === "amount" ? String(av).localeCompare(String(bv)) : av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv), "pt-BR");
    }
    return (order === "asc" ? cmp : -cmp) || a.id - b.id;
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  let data = rows.slice((page - 1) * size, page * size);
  // B10: com bug, a última página perde o último registro.
  if (bugs && page === totalPages && data.length > 1) data = data.slice(0, -1);

  return { data, page, size, total, totalPages };
}
