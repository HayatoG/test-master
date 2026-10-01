import { error, json } from "@/lib/api/http";
import { readJson } from "@/lib/api/products";
import { checkCoupon } from "@/lib/domain/cart";
import { findCoupon } from "@/lib/seed/coupons";

/** POST /api/coupons/validate { code, subtotal } */
export async function POST(request: Request) {
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "Corpo da requisição inválido");
  const { code, subtotal } = (parsed.body ?? {}) as { code?: unknown; subtotal?: unknown };
  if (typeof code !== "string" || !code.trim()) return error(400, "Informe o código do cupom");
  if (typeof subtotal !== "number" || subtotal < 0) return error(400, "Informe o subtotal (número)");
  const coupon = findCoupon(code);
  const check = checkCoupon(coupon, subtotal);
  if (!check.ok) return error(check.status, check.message);
  return json({ coupon });
}
