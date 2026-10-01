import { error, json } from "@/lib/api/http";
import { mulberry32 } from "@/lib/seed/prng";

/**
 * GET /api/flaky — falha com 500 em parte das chamadas, de propósito.
 *   ?failRate=0..1  probabilidade de falha (padrão 0.5)
 *   ?seed=N         torna o resultado determinístico: a mesma seed sempre dá o mesmo resultado
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const failRate = Number(params.get("failRate") ?? "0.5");
  if (Number.isNaN(failRate) || failRate < 0 || failRate > 1) return error(400, "Parâmetro 'failRate' deve estar entre 0 e 1");
  const seedParam = params.get("seed");
  if (seedParam !== null && !/^\d+$/.test(seedParam)) return error(400, "Parâmetro 'seed' deve ser um inteiro não negativo");
  const roll = seedParam !== null ? mulberry32(Number(seedParam))() : Math.random();
  if (roll < failRate) return error(500, "Falha intermitente simulada. Tente novamente.");
  return json({ status: "ok", message: "Desta vez funcionou!" });
}
