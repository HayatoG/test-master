import { error, json } from "@/lib/api/http";
import { requireToken } from "@/lib/api/token";
import { publicUser, USERS } from "@/lib/seed/users";

/** GET /api/users/:id (Bearer) */
export async function GET(request: Request, ctx: RouteContext<"/api/users/[id]">) {
  const auth = await requireToken(request);
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const user = USERS.find((u) => u.id === Number(id));
  if (!user) return error(404, "Usuário não encontrado");
  return json(publicUser(user));
}
