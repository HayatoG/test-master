import { onlyDigits } from "./masks";

export type ShippingQuote = { cep: string; region: string; price: number; days: number };
export type ShippingResult = { ok: true; quote: ShippingQuote } | { ok: false; status: 400 | 404; message: string };

/** Subtotal (antes do desconto) a partir do qual o frete é grátis. */
export const FREE_SHIPPING_THRESHOLD = 200;

const REGIONS: { digits: string; region: string; price: number; days: number }[] = [
  { digits: "0123", region: "Sudeste", price: 15.9, days: 4 },
  { digits: "45", region: "Nordeste", price: 29.9, days: 9 },
  { digits: "6", region: "Norte", price: 34.9, days: 12 },
  { digits: "7", region: "Centro-Oeste", price: 24.9, days: 7 },
  { digits: "89", region: "Sul", price: 19.9, days: 5 },
];

/** Cotação determinística pelo primeiro dígito do CEP. 99999-999 simula CEP inexistente. */
export function quoteShipping(rawCep: string): ShippingResult {
  const cep = onlyDigits(rawCep);
  if (cep.length !== 8 || cep === "00000000") return { ok: false, status: 400, message: "CEP inválido" };
  if (cep === "99999999") return { ok: false, status: 404, message: "CEP não encontrado" };
  const r = REGIONS.find((x) => x.digits.includes(cep[0]))!;
  return { ok: true, quote: { cep, region: r.region, price: r.price, days: r.days } };
}
