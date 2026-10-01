import { error, json } from "@/lib/api/http";
import { readJson } from "@/lib/api/products";
import { createToken } from "@/lib/api/token";
import { DEFAULT_PASSWORD, findUser } from "@/lib/seed/users";

/** POST /api/auth/token { username, password } → { token, tokenType, user } */
export async function POST(request: Request) {
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "Corpo da requisição inválido");
  const { username, password } = (parsed.body ?? {}) as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return error(400, "Informe username e password");
  }
  const user = findUser(username);
  if (!user || password !== DEFAULT_PASSWORD) return error(401, "Usuário ou senha inválidos");
  if (user.behavior === "locked") return error(403, "Usuário bloqueado");
  return json({ token: await createToken(user.username, user.role), tokenType: "Bearer", user: { username: user.username, role: user.role } });
}
