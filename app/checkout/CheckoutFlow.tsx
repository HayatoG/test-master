"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OrderSummary } from "@/components/OrderSummary";
import { Button } from "@/components/ui/Button";
import { FieldError, inputClass, labelClass } from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { useCart } from "@/lib/cart/useCart";
import { useOrders, type Address, type Order } from "@/lib/cart/useOrders";
import { maskCardExpiry, maskCardNumber, maskCEP, onlyDigits } from "@/lib/domain/masks";
import { formatBRL } from "@/lib/domain/money";
import { isValidCardNumber } from "@/lib/domain/validators";

const STEPS = ["Endereço", "Pagamento", "Revisão"] as const;
const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

type Payment = { method: "card" | "pix"; cardNumber: string; cardName: string; expiry: string; cvv: string; installments: number };
type Errors = Record<string, string | undefined>;

function validateAddress(a: Address): Errors {
  return {
    recipient: a.recipient.trim() ? undefined : "Informe o destinatário",
    cep: onlyDigits(a.cep).length === 8 ? undefined : "Informe um CEP válido",
    street: a.street.trim() ? undefined : "Informe a rua",
    number: a.number.trim() ? undefined : "Informe o número",
    city: a.city.trim() ? undefined : "Informe a cidade",
    uf: a.uf ? undefined : "Selecione o estado",
  };
}

function validatePayment(p: Payment, now: Date): Errors {
  if (p.method === "pix") return {};
  const [mm, yy] = p.expiry.split("/").map(Number);
  const expiryOk = mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm, 1) > now;
  return {
    cardNumber: isValidCardNumber(p.cardNumber) ? undefined : "Número de cartão inválido",
    cardName: p.cardName.trim() ? undefined : "Informe o nome impresso no cartão",
    expiry: /^\d\d\/\d\d$/.test(p.expiry) && expiryOk ? undefined : "Validade inválida ou vencida",
    cvv: /^\d{3,4}$/.test(p.cvv) ? undefined : "CVV deve ter 3 ou 4 dígitos",
  };
}

const hasErrors = (e: Errors) => Object.values(e).some(Boolean);

export function CheckoutFlow() {
  const { cart, lines, totals, hydrated, setShipping, clear } = useCart();
  const [, setOrders] = useOrders();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>({ recipient: "", cep: "", street: "", number: "", complement: "", city: "", uf: "" });
  const [payment, setPayment] = useState<Payment>({ method: "card", cardNumber: "", cardName: "", expiry: "", cvv: "", installments: 1 });
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Preenche o CEP com o calculado no carrinho.
  const cartCep = cart.shipping?.cep;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza uma vez com o carrinho já hidratado
    if (cartCep) setAddress((a) => (a.cep ? a : { ...a, cep: maskCEP(cartCep) }));
  }, [cartCep]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  if (!hydrated) return <Spinner label="Carregando checkout" />;

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

  const addressErrors = validateAddress(address);
  const paymentErrors = validatePayment(payment, new Date());
  const err = (e: Errors, k: string) => (showErrors ? e[k] : undefined);

  async function nextFromAddress() {
    setStepError(null);
    if (hasErrors(addressErrors)) {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/shipping?cep=${onlyDigits(address.cep)}`);
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStepError(data.error?.message ?? "Erro ao calcular o frete");
      return;
    }
    setShipping(data);
    setShowErrors(false);
    setStep(1);
  }

  function nextFromPayment() {
    if (hasErrors(paymentErrors)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(2);
  }

  async function placeOrder() {
    setStepError(null);
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items,
        coupons: cart.coupons,
        cep: address.cep,
        payment: payment.method === "card" ? { method: "card", cardNumber: payment.cardNumber, installments: payment.installments } : { method: "pix" },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStepError(data.error?.message ?? "Não foi possível concluir o pedido");
      return;
    }
    const order: Order = { ...data, address };
    setOrders((all) => [...all.filter((o) => o.id !== order.id), order]);
    clear();
    router.push(`/pedido/${order.id}`);
  }

  const setA = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddress((a) => ({ ...a, [k]: k === "cep" ? maskCEP(e.target.value) : e.target.value }));
  const describe = (e: Errors, id: string, k: string) => (err(e, k) ? `${id}-erro` : undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div>
        <ol aria-label="Etapas do checkout" className="mb-6 flex gap-2 text-sm">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={`flex-1 rounded-md border px-3 py-2 ${i === step ? "border-brand-600 bg-brand-50 font-semibold text-brand-700" : i < step ? "border-slate-200 bg-white text-slate-700" : "border-slate-200 bg-white text-slate-500"}`}
            >
              {i + 1}. {label}
              {i < step && <span className="sr-only"> (concluída)</span>}
            </li>
          ))}
        </ol>

        <section aria-labelledby="etapa-titulo" className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 id="etapa-titulo" ref={headingRef} tabIndex={-1} className="mb-4 text-lg font-semibold focus:outline-none">
            {STEPS[step]}
          </h2>

          {stepError && (
            <p role="alert" data-testid="checkout-error" className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {stepError}
            </p>
          )}

          {step === 0 && (
            <form
              noValidate
              aria-label="Endereço de entrega"
              onSubmit={(e) => {
                e.preventDefault();
                nextFromAddress();
              }}
              className="grid gap-4 md:grid-cols-6"
            >
              <div className="md:col-span-6">
                <label htmlFor="destinatario" className={labelClass}>Destinatário</label>
                <input id="destinatario" autoComplete="name" value={address.recipient} onChange={setA("recipient")} aria-invalid={!!err(addressErrors, "recipient")} aria-describedby={describe(addressErrors, "destinatario", "recipient")} className={`${inputClass} mt-1`} />
                <FieldError id="destinatario-erro" message={err(addressErrors, "recipient")} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="checkout-cep" className={labelClass}>CEP</label>
                <input id="checkout-cep" inputMode="numeric" placeholder="00000-000" value={address.cep} onChange={setA("cep")} aria-invalid={!!err(addressErrors, "cep")} aria-describedby={describe(addressErrors, "checkout-cep", "cep")} className={`${inputClass} mt-1`} />
                <FieldError id="checkout-cep-erro" message={err(addressErrors, "cep")} />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="rua" className={labelClass}>Rua</label>
                <input id="rua" autoComplete="address-line1" value={address.street} onChange={setA("street")} aria-invalid={!!err(addressErrors, "street")} aria-describedby={describe(addressErrors, "rua", "street")} className={`${inputClass} mt-1`} />
                <FieldError id="rua-erro" message={err(addressErrors, "street")} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="numero" className={labelClass}>Número</label>
                <input id="numero" value={address.number} onChange={setA("number")} aria-invalid={!!err(addressErrors, "number")} aria-describedby={describe(addressErrors, "numero", "number")} className={`${inputClass} mt-1`} />
                <FieldError id="numero-erro" message={err(addressErrors, "number")} />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="complemento" className={labelClass}>Complemento <span className="font-normal text-slate-500">(opcional)</span></label>
                <input id="complemento" value={address.complement} onChange={setA("complement")} className={`${inputClass} mt-1`} />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="cidade" className={labelClass}>Cidade</label>
                <input id="cidade" autoComplete="address-level2" value={address.city} onChange={setA("city")} aria-invalid={!!err(addressErrors, "city")} aria-describedby={describe(addressErrors, "cidade", "city")} className={`${inputClass} mt-1`} />
                <FieldError id="cidade-erro" message={err(addressErrors, "city")} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="checkout-uf" className={labelClass}>Estado</label>
                <select id="checkout-uf" value={address.uf} onChange={setA("uf")} aria-invalid={!!err(addressErrors, "uf")} aria-describedby={describe(addressErrors, "checkout-uf", "uf")} className={`${inputClass} mt-1`}>
                  <option value="">Selecione…</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                <FieldError id="checkout-uf-erro" message={err(addressErrors, "uf")} />
              </div>
              <div className="flex justify-end md:col-span-6">
                <Button type="submit" disabled={busy}>
                  {busy ? "Calculando frete…" : "Continuar"}
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form
              noValidate
              aria-label="Pagamento"
              onSubmit={(e) => {
                e.preventDefault();
                nextFromPayment();
              }}
              className="space-y-4"
            >
              <fieldset>
                <legend className={labelClass}>Forma de pagamento</legend>
                <div className="mt-2 flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="metodo" checked={payment.method === "card"} onChange={() => setPayment((p) => ({ ...p, method: "card" }))} />
                    Cartão de crédito
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="metodo" checked={payment.method === "pix"} onChange={() => setPayment((p) => ({ ...p, method: "pix" }))} />
                    Pix
                  </label>
                </div>
              </fieldset>

              {payment.method === "pix" ? (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">O código Pix será exibido após a confirmação do pedido.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-4">
                    <label htmlFor="cartao-numero" className={labelClass}>Número do cartão</label>
                    <input id="cartao-numero" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={payment.cardNumber} onChange={(e) => setPayment((p) => ({ ...p, cardNumber: maskCardNumber(e.target.value) }))} aria-invalid={!!err(paymentErrors, "cardNumber")} aria-describedby={describe(paymentErrors, "cartao-numero", "cardNumber")} className={`${inputClass} mt-1`} />
                    <FieldError id="cartao-numero-erro" message={err(paymentErrors, "cardNumber")} />
                  </div>
                  <div className="md:col-span-4">
                    <label htmlFor="cartao-nome" className={labelClass}>Nome impresso no cartão</label>
                    <input id="cartao-nome" autoComplete="cc-name" value={payment.cardName} onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value.toUpperCase() }))} aria-invalid={!!err(paymentErrors, "cardName")} aria-describedby={describe(paymentErrors, "cartao-nome", "cardName")} className={`${inputClass} mt-1`} />
                    <FieldError id="cartao-nome-erro" message={err(paymentErrors, "cardName")} />
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="cartao-validade" className={labelClass}>Validade</label>
                    <input id="cartao-validade" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={payment.expiry} onChange={(e) => setPayment((p) => ({ ...p, expiry: maskCardExpiry(e.target.value) }))} aria-invalid={!!err(paymentErrors, "expiry")} aria-describedby={describe(paymentErrors, "cartao-validade", "expiry")} className={`${inputClass} mt-1`} />
                    <FieldError id="cartao-validade-erro" message={err(paymentErrors, "expiry")} />
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="cartao-cvv" className={labelClass}>CVV</label>
                    <input id="cartao-cvv" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={payment.cvv} onChange={(e) => setPayment((p) => ({ ...p, cvv: onlyDigits(e.target.value) }))} aria-invalid={!!err(paymentErrors, "cvv")} aria-describedby={describe(paymentErrors, "cartao-cvv", "cvv")} className={`${inputClass} mt-1`} />
                    <FieldError id="cartao-cvv-erro" message={err(paymentErrors, "cvv")} />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="parcelas" className={labelClass}>Parcelas</label>
                    <select id="parcelas" value={payment.installments} onChange={(e) => setPayment((p) => ({ ...p, installments: Number(e.target.value) }))} className={`${inputClass} mt-1`}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatBRL(Math.round((totals.total / n) * 100) / 100)} sem juros
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  Voltar
                </Button>
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5 text-sm">
              <div>
                <h3 className="font-semibold">Itens</h3>
                <ul className="mt-2 space-y-1" aria-label="Itens do pedido">
                  {lines.map((l) => (
                    <li key={l.productId} className="flex justify-between">
                      <span>
                        {l.qty}× {l.product.name}
                      </span>
                      <span className="tabular-nums">{formatBRL(l.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Entrega</h3>
                <p className="mt-1" data-testid="review-address">
                  {address.recipient} — {address.street}, {address.number}
                  {address.complement && ` (${address.complement})`} — {address.city}/{address.uf} — CEP {address.cep}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Pagamento</h3>
                <p className="mt-1" data-testid="review-payment">
                  {payment.method === "pix" ? "Pix" : `Cartão final ${onlyDigits(payment.cardNumber).slice(-4)} em ${payment.installments}x`}
                </p>
                <Button variant="ghost" className="mt-1 px-0 text-brand-700" onClick={() => setStep(1)}>
                  Alterar pagamento
                </Button>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={placeOrder} disabled={busy}>
                  {busy ? "Processando pagamento…" : "Confirmar pedido"}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
      <OrderSummary totals={totals} />
    </div>
  );
}
