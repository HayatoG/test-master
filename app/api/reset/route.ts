import { BUGS_COOKIE, SESSION_COOKIE } from "@/lib/auth/constants";
import { json } from "@/lib/api/http";

/**
 * Volta o servidor ao estado inicial para este cliente: remove sessão e Modo
 * Bugs. Os dados da API são seed fixo, então não há mais nada a limpar.
 * O localStorage é limpo pela página /reset.
 */
export async function POST() {
  const res = json({ ok: true, message: "Estado inicial restaurado" });
  res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  res.headers.append("Set-Cookie", `${BUGS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`);
  return res;
}
