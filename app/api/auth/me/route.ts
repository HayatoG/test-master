import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySession } from "@/lib/auth/session";
import { error, json } from "@/lib/api/http";
import { findUser, publicUser } from "@/lib/seed/users";

/** Usuário da sessão atual (cookie). */
export async function GET() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  const user = session && findUser(session.username);
  if (!user) return error(401, "Não autenticado");
  return json({ user: publicUser(user) });
}
