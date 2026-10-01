import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";
import { verifySession } from "./session";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
