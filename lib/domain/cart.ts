import type { Coupon } from "@/lib/seed/coupons";
import { roundMoney } from "./money";
import { FREE_SHIPPING_THRESHOLD } from "./shipping";

export type CartLine = { price: number; qty: number };

export type CartTotals = {
  subtotal: number;
  discount: number;
  /** null enquanto o frete não foi calculado. */
  shipping: number | null;
  freeShipping: boolean;
  total: number;
  /** Cupons aplicados que não valem para o subtotal atual. */
  inactiveCoupons: string[];
};

/**
 * Regras de preço do carrinho — usadas pela UI e pela API de pedidos.
 *  - Desconto percentual sobre o subtotal (respeitando o subtotal mínimo).
 *  - Frete grátis com cupom FRETEGRATIS ou subtotal >= R$ 200,00 (antes do desconto).
 *  - Total = subtotal − desconto + frete.
 * As linhas devem estar na ordem em que os itens foram adicionados.
 */
export function computeTotals(lines: CartLine[], coupons: Coupon[], shippingBase: number | null, bugs = false): CartTotals {
  const subtotal = roundMoney(
    lines.reduce((sum, line, i) => {
      // B12: com bug e 2+ itens no carrinho, o último item adicionado conta como quantidade 1.
      const qty = bugs && lines.length > 1 && i === lines.length - 1 ? 1 : line.qty;
      return sum + line.price * qty;
    }, 0),
  );

  const inactiveCoupons: string[] = [];
  let discount = 0;
  for (const c of coupons) {
    if (c.minSubtotal && subtotal < c.minSubtotal) {
      inactiveCoupons.push(c.code);
      continue;
    }
    if (c.type === "percent") discount += (subtotal * c.value) / 100;
  }
  discount = roundMoney(Math.min(discount, subtotal));

  // B14: com bug, o limite usa ">" e R$ 200,00 exatos não ganham frete grátis.
  const reachesThreshold = bugs ? subtotal > FREE_SHIPPING_THRESHOLD : subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShipping = reachesThreshold || coupons.some((c) => c.type === "free-shipping");
  const shipping = shippingBase === null ? null : freeShipping ? 0 : shippingBase;

  const total = roundMoney(subtotal - discount + (shipping ?? 0));
  return { subtotal, discount, shipping, freeShipping, total, inactiveCoupons };
}

/** Valida um cupom para o subtotal informado. */
export function checkCoupon(coupon: Coupon | undefined, subtotal: number): { ok: true } | { ok: false; status: number; message: string } {
  if (!coupon) return { ok: false, status: 404, message: "Cupom inválido" };
  if (coupon.expired) return { ok: false, status: 422, message: "Cupom expirado" };
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return { ok: false, status: 422, message: `Este cupom exige subtotal mínimo de R$ ${coupon.minSubtotal.toFixed(2).replace(".", ",")}` };
  }
  return { ok: true };
}

/** Hash FNV-1a curto para gerar ids determinísticos (mesmo pedido → mesmo número). */
export function shortHash(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}
