import { error, json } from "@/lib/api/http";
import { bugsEnabledForRequest } from "@/lib/bugs/server";
import { parseTableQuery, queryTable } from "@/lib/domain/table-query";

/**
 * GET /api/table-rows?page=1&size=10&sort=id&order=asc&q=&status=
 * Paginação, ordenação, busca e filtro feitos no servidor sobre o seed fixo.
 */
export async function GET(request: Request) {
  const parsed = parseTableQuery(new URL(request.url).searchParams);
  if ("error" in parsed) return error(400, parsed.error);
  return json(queryTable(parsed, bugsEnabledForRequest(request)));
}
