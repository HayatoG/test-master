import { NextResponse, type NextRequest } from "next/server";
import { BUGS_COOKIE, PROTECTED_PREFIXES, SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySession } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ?bugs=on|off em qualquer página: grava o cookie e remove o parâmetro da URL.
  const bugs = searchParams.get("bugs");
  if (bugs === "on" || bugs === "off") {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("bugs");
    const res = NextResponse.redirect(clean);
    res.cookies.set(BUGS_COOKIE, bugs, { path: "/", sameSite: "lax" });
    return res;
  }

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
    if (session.mustChangePassword && pathname !== "/trocar-senha") {
      return NextResponse.redirect(new URL("/trocar-senha", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Páginas apenas: as rotas de API tratam auth e Modo Bugs por conta própria.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
