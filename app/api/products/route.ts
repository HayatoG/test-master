import { error, json } from "@/lib/api/http";
import { readJson, validateProductBody } from "@/lib/api/products";
import { requireToken } from "@/lib/api/token";
import { bugsEnabledForRequest } from "@/lib/bugs/server";
import { CATEGORIES, PRODUCTS } from "@/lib/seed/products";

/** GET /api/products?page=1&size=20&category=Livros&q=texto */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? "1");
  const size = Number(params.get("size") ?? "20");
  const category = params.get("category");
  const q = params.get("q")?.trim().toLowerCase();
  if (!Number.isInteger(page) || page < 1) return error(400, "Parâmetro 'page' deve ser um inteiro >= 1");
  if (!Number.isInteger(size) || size < 1 || size > 100) return error(400, "Parâmetro 'size' deve ser um inteiro entre 1 e 100");
  if (category && !(CATEGORIES as readonly string[]).includes(category)) return error(400, `Categoria inválida. Use uma de: ${CATEGORIES.join(", ")}`);

  let items = PRODUCTS.slice();
  if (category) items = items.filter((p) => p.category === category);
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));
  const total = items.length;
  return json({ data: items.slice((page - 1) * size, page * size), page, size, total, totalPages: Math.max(1, Math.ceil(total / size)) });
}

/**
 * POST /api/products (Bearer) — valida e devolve o produto "criado".
 * A API é stateless: o produto não aparece em GETs seguintes.
 */
export async function POST(request: Request) {
  const auth = await requireToken(request);
  if (auth instanceof Response) return auth;
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "Corpo da requisição inválido");
  const result = validateProductBody(parsed.body);
  if (!result.ok) return error(400, "Dados inválidos", result.issues);
  if (PRODUCTS.some((p) => p.sku === result.value.sku)) return error(409, "Já existe um produto com este SKU");

  const id = PRODUCTS.length + 1;
  // B18: com bug, a criação responde 200 em vez de 201.
  const status = bugsEnabledForRequest(request) ? 200 : 201;
  return json({ id, ...result.value }, status, { Location: `/api/products/${id}` });
}
