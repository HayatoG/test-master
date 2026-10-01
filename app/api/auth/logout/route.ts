import { SESSION_COOKIE } from "@/lib/auth/constants";
import { json } from "@/lib/api/http";
import { bugsEnabledForRequest } from "@/lib/bugs/server";

export async function POST(request: Request) {
  const res = json({ ok: true });
  // B02: com o Modo Bugs ligado o logout "funciona" na UI, mas o cookie continua válido.
  if (!bugsEnabledForRequest(request)) {
    res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  }
  return res;
}
