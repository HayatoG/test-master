import { cookies } from "next/headers";
import { BUGS_COOKIE } from "@/lib/auth/constants";

/** Páginas/server components: lê o cookie do Modo Bugs. */
export async function bugsEnabled() {
  const store = await cookies();
  return store.get(BUGS_COOKIE)?.value === "on";
}

/**
 * Rotas de API: aceita cookie, query param (?bugs=on) ou header X-Bugs: on,
 * para que testes de API também possam ligar os bugs.
 */
export function bugsEnabledForRequest(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("bugs");
  if (q === "on") return true;
  if (q === "off") return false;
  if (req.headers.get("x-bugs") === "on") return true;
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.split(/;\s*/).includes(`${BUGS_COOKIE}=on`);
}
