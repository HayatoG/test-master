import type { NextResponse } from "next/server";
import { REMEMBER_ME_SECONDS, SESSION_COOKIE } from "./constants";
import { signSession, type SessionPayload } from "./session";

/** Grava o cookie de sessão. Sem "lembrar-me" vira cookie de sessão (some ao fechar o navegador). */
export async function setSessionCookie(res: NextResponse, request: Request, payload: SessionPayload, remember: boolean) {
  const secure = new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  res.cookies.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...(remember ? { maxAge: REMEMBER_ME_SECONDS } : {}),
  });
}
