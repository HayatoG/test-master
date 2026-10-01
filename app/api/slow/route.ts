import { error, json, sleep } from "@/lib/api/http";

const MAX_DELAY_MS = 8000;

/** GET /api/slow?ms=3000 — responde depois do atraso pedido (máx. 8s). */
export async function GET(request: Request) {
  const ms = Number(new URL(request.url).searchParams.get("ms") ?? "3000");
  if (!Number.isInteger(ms) || ms < 0 || ms > MAX_DELAY_MS) return error(400, `Parâmetro 'ms' deve ser um inteiro entre 0 e ${MAX_DELAY_MS}`);
  const started = Date.now();
  await sleep(ms);
  return json({ requestedDelayMs: ms, actualDelayMs: Date.now() - started });
}
