import { error, json } from "@/lib/api/http";
import { readJson, validateProductBody } from "@/lib/api/products";
import { requireToken } from "@/lib/api/token";
import { bugsEnabledForRequest } from "@/lib/bugs/server";
import { findProduct, PRODUCTS } from "@/lib/seed/products";

type Ctx = RouteContext<"/api/products/[id]">;

async function parseId(ctx: Ctx) {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** GET /api/products/:id */
export async function GET(request: Request, ctx: Ctx) {
  const id = await parseId(ctx);
  if (id === null) return error(400, "O id deve ser um inteiro positivo");
  const product = findProduct(id);
  if (!product) {
    // B19: com bug, produto inexistente responde 200 com objeto vazio.
    return bugsEnabledForRequest(request) ? json({}) : error(404, "Produto não encontrado");
  }
  return json(product);
}

/** PUT /api/products/:id (Bearer) — substitui todos os campos. Stateless. */
export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireToken(request);
  if (auth instanceof Response) return auth;
  const id = await parseId(ctx);
  if (id === null) return error(400, "O id deve ser um inteiro positivo");
  if (!findProduct(id)) return error(404, "Produto não encontrado");
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "Corpo da requisição inválido");
  const result = validateProductBody(parsed.body);
  if (!result.ok) return error(400, "Dados inválidos", result.issues);
  if (PRODUCTS.some((p) => p.sku === result.value.sku && p.id !== id)) return error(409, "Já existe um produto com este SKU");
  return json({ id, ...result.value });
}

/** DELETE /api/products/:id (Bearer, somente admin) */
export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireToken(request);
  if (auth instanceof Response) return auth;
  if (auth.role !== "admin") return error(403, "Apenas administradores podem excluir produtos");
  const id = await parseId(ctx);
  if (id === null) return error(400, "O id deve ser um inteiro positivo");
  if (!findProduct(id)) return error(404, "Produto não encontrado");
  return new Response(null, { status: 204 });
}
