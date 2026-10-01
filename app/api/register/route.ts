import { error, json, sleep } from "@/lib/api/http";

/** Cadastro simulado do módulo de formulários. Nada é persistido. */
const TAKEN_EMAIL = "existente@qa.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return error(400, "Corpo da requisição inválido");
  await sleep(600);
  if (typeof body.email === "string" && body.email.trim().toLowerCase() === TAKEN_EMAIL) {
    return error(409, "Este e-mail já está cadastrado");
  }
  return json({ id: 1001, ...body, password: undefined, passwordConfirm: undefined }, 201);
}
