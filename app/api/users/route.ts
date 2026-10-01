import { json } from "@/lib/api/http";
import { requireToken } from "@/lib/api/token";
import { publicUser, USERS } from "@/lib/seed/users";

/** GET /api/users (Bearer) */
export async function GET(request: Request) {
  const auth = await requireToken(request);
  if (auth instanceof Response) return auth;
  return json({ data: USERS.map(publicUser), total: USERS.length });
}
