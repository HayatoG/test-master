import { signValue, verifyValue } from "@/lib/auth/session";
import type { Role } from "@/lib/seed/users";
import { error } from "./http";

export type ApiToken = { kind: "api"; username: string; role: Role };

/** Token determinístico: o mesmo usuário recebe sempre o mesmo token. */
export const createToken = (username: string, role: Role) => signValue({ kind: "api", username, role } satisfies ApiToken);

/**
 * Exige "Authorization: Bearer <token>". Retorna o token decodificado ou uma
 * Response 401 pronta para ser devolvida pela rota.
 */
export async function requireToken(request: Request): Promise<ApiToken | Response> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const unauthorized = (message: string) => {
    const res = error(401, message);
    res.headers.set("WWW-Authenticate", 'Bearer realm="qa-playground"');
    return res;
  };
  if (!match) return unauthorized("Token de acesso ausente. Envie o header Authorization: Bearer <token>.");
  const token = await verifyValue<ApiToken>(match[1].trim());
  if (!token || token.kind !== "api") return unauthorized("Token de acesso inválido");
  return token;
}
