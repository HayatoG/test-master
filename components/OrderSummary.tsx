import type { CartTotals } from "@/lib/domain/cart";
import { formatBRL } from "@/lib/domain/money";

/** Resumo de valores usado no carrinho, no checkout e no pedido confirmado. */
export function OrderSummary({ totals, title = "Resumo do pedido" }: { totals: CartTotals; title?: string }) {
  return (
    <section aria-labelledby="resumo-titulo" className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 id="resumo-titulo" className="font-semibold">
        {title}
      </h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd data-testid="summary-subtotal" className="tabular-nums">
            {formatBRL(totals.subtotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto</dt>
          <dd data-testid="summary-discount" className="tabular-nums text-emerald-700">
            {totals.discount > 0 ? `− ${formatBRL(totals.discount)}` : formatBRL(0)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Frete</dt>
          <dd data-testid="summary-shipping" className="tabular-nums">
            {totals.shipping === null ? "A calcular" : totals.shipping === 0 ? "Grátis" : formatBRL(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd data-testid="summary-total" className="tabular-nums">
            {formatBRL(totals.total)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
