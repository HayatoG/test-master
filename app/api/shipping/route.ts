import { error, json, sleep } from "@/lib/api/http";
import { quoteShipping } from "@/lib/domain/shipping";

/** GET /api/shipping?cep=01310100 — cotação de frete (demora 500ms). */
export async function GET(request: Request) {
  const cep = new URL(request.url).searchParams.get("cep") ?? "";
  await sleep(500);
  const result = quoteShipping(cep);
  if (!result.ok) return error(result.status, result.message);
  return json(result.quote);
}
