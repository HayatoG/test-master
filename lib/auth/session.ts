/**
 * Sessão assinada com HMAC-SHA256 (Web Crypto). Não depende de estado no
 * servidor: qualquer instância serverless valida o cookie sozinha.
 * Formato: base64url(JSON payload) + "." + base64url(assinatura)
 */
import type { Role } from "@/lib/seed/users";

export type SessionPayload = {
  username: string;
  role: Role;
  /** true quando o usuário precisa trocar a senha (expired_user). */
  mustChangePassword?: boolean;
  iat: number;
};

const encoder = new TextEncoder();

function secret() {
  return process.env.SESSION_SECRET || "qa-playground-dev-secret-change-me";
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

export async function signValue(payload: object) {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function verifyValue<T>(token: string | undefined | null): Promise<T | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmac(body);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T;
  } catch {
    return null;
  }
}

export const signSession = (p: SessionPayload) => signValue(p);
export const verifySession = (t: string | undefined | null) => verifyValue<SessionPayload>(t);
