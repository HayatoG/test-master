import { error } from "@/lib/api/http";
import { toCsv } from "@/lib/domain/files";
import { TABLE_ROWS } from "@/lib/seed/table-rows";

/** GET /api/export?format=csv|json — relatório de clientes para download. */
export function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  if (format === "csv") {
    const csv = toCsv([["id", "cliente", "email", "cidade", "status", "valor", "data"], ...TABLE_ROWS.map((r) => [r.id, r.customer, r.email, r.city, r.status, r.amount, r.createdAt])]);
    return new Response(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="relatorio-clientes.csv"' },
    });
  }
  if (format === "json") {
    return new Response(JSON.stringify({ total: TABLE_ROWS.length, data: TABLE_ROWS }, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="relatorio-clientes.json"' },
    });
  }
  return error(400, "Formato inválido. Use csv ou json.");
}
