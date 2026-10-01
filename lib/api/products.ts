import { CATEGORIES, type Product } from "@/lib/seed/products";

export type FieldIssue = { field: string; message: string };

/** Valida o corpo de criação/edição (POST e PUT) de produto na API. */
export function validateProductBody(body: unknown): { ok: true; value: Omit<Product, "id"> } | { ok: false; issues: FieldIssue[] } {
  const issues: FieldIssue[] = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, issues: [{ field: "body", message: "O corpo deve ser um objeto JSON" }] };
  }
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim()) issues.push({ field: "name", message: "Obrigatório (texto)" });
  if (typeof b.sku !== "string" || !/^[A-Z]{3}-\d{3}$/.test(b.sku)) issues.push({ field: "sku", message: "Obrigatório no formato AAA-000" });
  if (typeof b.category !== "string" || !(CATEGORIES as readonly string[]).includes(b.category)) {
    issues.push({ field: "category", message: `Deve ser uma de: ${CATEGORIES.join(", ")}` });
  }
  if (typeof b.price !== "number" || !(b.price > 0)) issues.push({ field: "price", message: "Deve ser um número maior que zero" });
  if (typeof b.stock !== "number" || !Number.isInteger(b.stock) || b.stock < 0) issues.push({ field: "stock", message: "Deve ser um inteiro maior ou igual a zero" });
  if (b.description !== undefined && typeof b.description !== "string") issues.push({ field: "description", message: "Deve ser texto" });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      name: (b.name as string).trim(),
      sku: b.sku as string,
      category: b.category as string,
      price: b.price as number,
      stock: b.stock as number,
      description: ((b.description as string | undefined) ?? "").trim(),
    },
  };
}

export async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}
