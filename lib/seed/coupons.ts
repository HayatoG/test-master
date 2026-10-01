export type Coupon = {
  code: string;
  description: string;
  type: "percent" | "free-shipping";
  value: number;
  minSubtotal?: number;
  expired?: boolean;
};

export const COUPONS: readonly Coupon[] = [
  { code: "QA10", description: "10% de desconto no subtotal", type: "percent", value: 10 },
  { code: "FRETEGRATIS", description: "Frete grátis", type: "free-shipping", value: 0 },
  { code: "MINIMO100", description: "15% de desconto em compras a partir de R$ 100,00", type: "percent", value: 15, minSubtotal: 100 },
  { code: "EXPIRADO", description: "Cupom expirado", type: "percent", value: 50, expired: true },
];

export function findCoupon(code: string) {
  return COUPONS.find((c) => c.code === code.trim().toUpperCase());
}
