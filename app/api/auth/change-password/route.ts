import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { setSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { DEFAULT_PASSWORD } from "@/lib/seed/users";

/** Troca de senha simulada: valida as regras e libera a sessão do expired_user. */
export async function POST(request: Request) {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: { status: 401, message: "Não autenticado" } }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return NextResponse.json({ error: { status: 400, message: "A nova senha deve ter pelo menos 8 caracteres" } }, { status: 400 });
  }
  if (password === DEFAULT_PASSWORD) {
    return NextResponse.json({ error: { status: 400, message: "A nova senha deve ser diferente da atual" } }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  await setSessionCookie(res, request, { ...session, mustChangePassword: false, iat: Date.now() }, false);
  return res;
}
