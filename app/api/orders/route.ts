import { error, json, sleep } from "@/lib/api/http";
import { readJson } from "@/lib/api/products";
import { bugsEnabledForRequest } from "@/lib/bugs/server";
import { computeTotals, shortHash } from "@/lib/domain/cart";
import { onlyDigits } from "@/lib/domain/masks";
import { quoteShipping } from "@/lib/domain/shipping";
import { isValidCardNumber } from "@/lib/domain/validators";
import { findCoupon, type Coupon } from "@/lib/seed/coupons";
import { findProduct } from "@/lib/seed/products";

/** Cartão de teste que sempre é recusado. */
const DECLINED_CARD = "4000000000000002";

type OrderBody = {
  items?: { productId: number; qty: number }[];
  coupons?: string[];
  cep?: string;
  payment?: { method: "card" | "pix"; cardNumber?: string; installments?: number };
};

/**
 * POST /api/orders — recalcula tudo no servidor (preços do seed, cupons e
 * frete) e devolve o pedido. Nada é persistido: o client guarda o pedido.
 */
export async function POST(request: Request) {
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "Corpo da requisição inválido");
  const body = parsed.body as OrderBody;

  if (!Array.isArray(body.items) || body.items.length === 0) return error(400, "O pedido precisa de pelo menos um item");
  const lines = [];
  for (const item of body.items) {
    const product = findProduct(Number(item.productId));
    if (!product) return error(400, `Produto ${item.productId} não existe`);
    if (!Number.isInteger(item.qty) || item.qty < 1) return error(400, `Quantidade inválida para o produto ${item.productId}`);
    if (item.qty > product.stock) return error(409, `Estoque insuficiente para ${product.name}`);
    lines.push({ productId: product.id, name: product.name, price: product.price, qty: item.qty });
  }

  const coupons = (body.coupons ?? []).map(findCoupon).filter((c): c is Coupon => !!c && !c.expired);
  const shipping = quoteShipping(body.cep ?? "");
  if (!shipping.ok) return error(400, shipping.message);

  const payment = body.payment;
  if (!payment || (payment.method !== "card" && payment.method !== "pix")) return error(400, "Forma de pagamento inválida");
  if (payment.method === "card") {
    const card = onlyDigits(payment.cardNumber ?? "");
    if (!isValidCardNumber(card)) return error(400, "Número de cartão inválido");
    await sleep(800);
    if (card === DECLINED_CARD) return error(402, "Pagamento recusado pela operadora");
  }

  const totals = computeTotals(lines, coupons, shipping.quote.price, bugsEnabledForRequest(request));
  const id = `PED-${shortHash(JSON.stringify({ lines, coupons: coupons.map((c) => c.code), cep: shipping.quote.cep, method: payment.method }))}`;

  return json(
    {
      id,
      items: lines,
      coupons: coupons.map((c) => c.code),
      shipping: shipping.quote,
      payment: {
        method: payment.method,
        ...(payment.method === "card" ? { last4: onlyDigits(payment.cardNumber ?? "").slice(-4), installments: payment.installments ?? 1 } : {}),
      },
      totals,
    },
    201,
  );
}
