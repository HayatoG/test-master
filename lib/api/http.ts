/** Helpers para respostas JSON consistentes na API pública. */
export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers });
}

export function error(status: number, message: string, details?: unknown) {
  return Response.json({ error: { status, message, ...(details ? { details } : {}) } }, { status });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
