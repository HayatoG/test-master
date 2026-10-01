export const SESSION_COOKIE = "qap_session";
export const BUGS_COOKIE = "qap_bugs";
/** Duração do cookie quando "Lembrar-me" está marcado. */
export const REMEMBER_ME_SECONDS = 60 * 60 * 24 * 30;
/** Rotas que exigem login (prefixos). */
export const PROTECTED_PREFIXES = ["/area-logada", "/admin", "/produtos", "/checkout", "/pedido", "/trocar-senha"];
