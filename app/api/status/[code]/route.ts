import { error, json } from "@/lib/api/http";

const MESSAGES: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  418: "I'm a teapot",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

/** GET /api/status/:code — devolve exatamente o status pedido (200–599). */
async function handle(_request: Request, ctx: RouteContext<"/api/status/[code]">) {
  const { code } = await ctx.params;
  const status = Number(code);
  if (!Number.isInteger(status) || status < 200 || status > 599) return error(400, "Use um status entre 200 e 599");
  if (status === 204 || status === 205 || status === 304) return new Response(null, { status });
  const headers: HeadersInit = status === 429 ? { "Retry-After": "1" } : {};
  return json({ status, message: MESSAGES[status] ?? "Status simulado" }, status, headers);
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
