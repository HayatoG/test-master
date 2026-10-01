"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderSummary } from "@/components/OrderSummary";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { useCart } from "@/lib/cart/useCart";
import { maskCEP } from "@/lib/domain/masks";
import { formatBRL, roundMoney } from "@/lib/domain/money";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/domain/shipping";

export function CartView() {
  const { cart, lines, totals, hydrated, setQty, remove, setCoupons, setShipping, coupons } = useCart();
  const { enabled: bugs } = useBugs();
  const toast = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cep, setCep] = useState("");
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  if (!hydrated) return <Spinner label="Carregando carrinho" />;

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium">Seu carrinho está vazio</p>
        <Link href="/loja" className="mt-3 inline-block text-brand-700 underline">
          Ir para a loja
        </Link>
      </div>
    );
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Informe um cupom");
      return;
    }
    // B13: com bug, o mesmo cupom pode ser aplicado de novo e o desconto acumula.
    if (cart.coupons.includes(code) && !bugs) {
      setCouponError("Este cupom já foi aplicado");
      return;
    }
    setCouponLoading(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal: totals.subtotal }),
    });
    const data = await res.json();
    setCouponLoading(false);
    if (!res.ok) {
      setCouponError(data.error?.message ?? "Erro ao validar o cupom");
      return;
    }
    // Um cupom por vez: um cupom diferente substitui o anterior.
    setCoupons(cart.coupons.includes(code) ? [...cart.coupons, code] : [code]);
    setCouponCode("");
    toast(`Cupom ${code} aplicado`);
  }

  async function calcShipping(e: React.FormEvent) {
    e.preventDefault();
    setCepError(null);
    setCepLoading(true);
    const res = await fetch(`/api/shipping?cep=${encodeURIComponent(cep)}`);
    const data = await res.json();
    setCepLoading(false);
    if (!res.ok) {
      setCepError(data.error?.message ?? "Erro ao calcular o frete");
      setShipping(null);
      return;
    }
    setShipping(data);
  }

  const missingForFree = roundMoney(FREE_SHIPPING_THRESHOLD - totals.subtotal);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <ul aria-label="Itens do carrinho" className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {lines.map((line) => (
            <li key={line.productId} aria-label={line.product.name} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-48 flex-1">
                <p className="font-medium">{line.product.name}</p>
                <p className="text-sm text-slate-600 tabular-nums">{formatBRL(line.product.price)} cada</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="secondary" aria-label={`Diminuir quantidade de ${line.product.name}`} disabled={line.qty <= 1} onClick={() => setQty(line.productId, line.qty - 1)} className="px-3">
                  −
                </Button>
                <label htmlFor={`qtd-${line.productId}`} className="sr-only">
                  Quantidade de {line.product.name}
                </label>
                <input
                  id={`qtd-${line.productId}`}
                  type="number"
                  min={1}
                  max={line.product.stock}
                  value={line.qty}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isInteger(n) && n >= 1) setQty(line.productId, n);
                  }}
                  className="w-16 rounded-md border border-slate-300 px-2 py-2 text-center text-sm"
                />
                <Button variant="secondary" aria-label={`Aumentar quantidade de ${line.product.name}`} disabled={line.qty >= line.product.stock} onClick={() => setQty(line.productId, line.qty + 1)} className="px-3">
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold tabular-nums" data-testid="line-total">
                {formatBRL(line.lineTotal)}
              </p>
              <Button variant="ghost" className="text-red-700" onClick={() => remove(line.productId)}>
                Remover<span className="sr-only"> {line.product.name}</span>
              </Button>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={applyCoupon} noValidate aria-label="Cupom" className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="cupom" className={labelClass}>
              Cupom de desconto
            </label>
            <div className="mt-1 flex gap-2">
              <input id="cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} aria-invalid={!!couponError} aria-describedby={couponError ? "cupom-erro" : undefined} className={`${inputClass} uppercase`} />
              <Button type="submit" variant="secondary" disabled={couponLoading}>
                {couponLoading ? "Validando…" : "Aplicar"}
              </Button>
            </div>
            {couponError && (
              <p id="cupom-erro" role="alert" className="mt-2 text-sm text-red-700">
                {couponError}
              </p>
            )}
            {coupons.length > 0 && (
              <ul aria-label="Cupons aplicados" className="mt-3 flex flex-wrap gap-2">
                {coupons.map((c, i) => (
                  <li key={`${c.code}-${i}`} className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-900">
                    <span>
                      {c.code} — {c.description}
                      {totals.inactiveCoupons.includes(c.code) && " (subtotal abaixo do mínimo)"}
                    </span>
                    <button type="button" aria-label={`Remover cupom ${c.code}`} onClick={() => setCoupons(cart.coupons.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <form onSubmit={calcShipping} noValidate aria-label="Frete" className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="cep" className={labelClass}>
              CEP
            </label>
            <div className="mt-1 flex gap-2">
              <input id="cep" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} aria-invalid={!!cepError} aria-describedby={cepError ? "cep-erro" : undefined} className={inputClass} />
              <Button type="submit" variant="secondary" disabled={cepLoading}>
                {cepLoading ? "Calculando…" : "Calcular frete"}
              </Button>
            </div>
            {cepError && (
              <p id="cep-erro" role="alert" className="mt-2 text-sm text-red-700">
                {cepError}
              </p>
            )}
            {cart.shipping && !cepError && (
              <p className="mt-2 text-sm text-slate-700" data-testid="shipping-info">
                Entrega para região {cart.shipping.region} em até {cart.shipping.days} dias úteis ({maskCEP(cart.shipping.cep)}).
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="space-y-3">
        <OrderSummary totals={totals} />
        <p className="text-sm text-slate-600" data-testid="free-shipping-hint">
          {missingForFree > 0 ? `Faltam ${formatBRL(missingForFree)} para ganhar frete grátis.` : "Você ganhou frete grátis!"}
        </p>
        <Link href="/checkout" className="block rounded-md bg-brand-600 px-4 py-3 text-center font-medium text-white hover:bg-brand-700">
          Finalizar compra
        </Link>
        <Link href="/loja" className="block text-center text-sm text-brand-700 underline">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
