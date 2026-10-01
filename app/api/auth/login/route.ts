import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/cookies";
import { sleep } from "@/lib/api/http";
import { bugsEnabledForRequest } from "@/lib/bugs/server";
import { DEFAULT_PASSWORD, findUser, publicUser, SLOW_LOGIN_MS } from "@/lib/seed/users";

type Body = { username?: unknown; password?: unknown; remember?: unknown };

function fail(status: number, message: string) {
  return NextResponse.json({ error: { status, message } }, { status });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Corpo da requisição inválido");
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  if (!username || !password) return fail(400, "Usuário e senha são obrigatórios");

  const user = findUser(username);
  if (!user || password !== DEFAULT_PASSWORD) return fail(401, "Usuário ou senha inválidos");

  if (user.behavior === "slow") await sleep(SLOW_LOGIN_MS);

  // B01: com o Modo Bugs, "lembrar-me" ignora o bloqueio do locked_user.
  const bypassLock = remember && bugsEnabledForRequest(request);
  if (user.behavior === "locked" && !bypassLock) {
    return fail(403, "Este usuário está bloqueado. Procure o administrador.");
  }

  const mustChangePassword = user.behavior === "expired";
  const res = NextResponse.json({
    user: publicUser(user),
    redirectTo: mustChangePassword ? "/trocar-senha" : null,
  });
  await setSessionCookie(res, request, { username: user.username, role: user.role, mustChangePassword, iat: Date.now() }, remember);
  return res;
}
