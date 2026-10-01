"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderSummary } from "@/components/OrderSummary";
import { Spinner } from "@/components/ui/Spinner";
import { useOrders } from "@/lib/cart/useOrders";
import { formatBRL } from "@/lib/domain/money";

export default function PedidoPage() {
  const { id } = useParams<{ id: string }>();
  const [orders, , hydrated] = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) return <Spinner label="Carregando pedido" />;

  if (!order) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">Pedido não encontrado</h1>
        <Link href="/loja" className="mt-3 inline-block text-brand-700 underline">
          Ir para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-lg border border-emerald-300 bg-white p-6">
        <h1 className="text-2xl font-semibold text-emerald-800">Pedido confirmado!</h1>
        <p className="mt-2">
          Número do pedido: <strong data-testid="order-number">{order.id}</strong>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Entrega em até {order.shipping.days} dias úteis para {order.address.city}/{order.address.uf}.
        </p>
        {order.payment.method === "pix" && (
          <p className="mt-4 rounded-md bg-slate-50 p-3 font-mono text-xs break-all" data-testid="pix-code">
            00020126580014BR.GOV.BCB.PIX0136{order.id}5204000053039865802BR5913QA PLAYGROUND
          </p>
        )}
        <h2 className="mt-6 font-semibold">Itens</h2>
        <ul className="mt-2 space-y-1 text-sm" aria-label="Itens do pedido">
          {order.items.map((i) => (
            <li key={i.productId} className="flex justify-between">
              <span>
                {i.qty}× {i.name}
              </span>
              <span className="tabular-nums">{formatBRL(Math.round(i.price * i.qty * 100) / 100)}</span>
            </li>
          ))}
        </ul>
        <Link href="/loja" className="mt-6 inline-block text-brand-700 underline">
          Continuar comprando
        </Link>
      </div>
      <OrderSummary totals={order.totals} title="Valores do pedido" />
    </div>
  );
}
