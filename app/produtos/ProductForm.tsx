"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, inputClass, labelClass } from "@/components/ui/form";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { CATEGORIES, type Product } from "@/lib/seed/products";

export type ProductInput = Omit<Product, "id">;

type FormValues = { name: string; sku: string; category: string; price: string; stock: string; description: string };
type Errors = Partial<Record<keyof FormValues, string>>;

// B20: contador de cliques em "Salvar" desde o carregamento da página.
let saveClicks = 0;

function validate(v: FormValues, others: Product[], bugs: boolean): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Informe o nome";
  if (!v.sku.trim()) e.sku = "Informe o SKU";
  else if (!/^[A-Z]{3}-\d{3}$/.test(v.sku.trim())) e.sku = "Use o formato AAA-000";
  else if (others.some((p) => p.sku === v.sku.trim())) e.sku = "Já existe um produto com este SKU";
  if (!v.category) e.category = "Selecione a categoria";
  const price = Number(v.price);
  if (v.price.trim() === "" || Number.isNaN(price)) e.price = "Informe o preço";
  // B07: com bug, preço zero ou negativo passa.
  else if (price <= 0 && !bugs) e.price = "O preço deve ser maior que zero";
  const stock = Number(v.stock);
  if (v.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) e.stock = "Informe um estoque inteiro maior ou igual a zero";
  return e;
}

export function ProductForm({
  initial,
  others,
  submitLabel,
  onSubmit,
}: {
  initial?: Product;
  others: Product[];
  submitLabel: string;
  onSubmit: (input: ProductInput) => void;
}) {
  const { enabled: bugs } = useBugs();
  const [values, setValues] = useState<FormValues>({
    name: initial?.name ?? "",
    sku: initial?.sku ?? "",
    category: initial?.category ?? "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
    description: initial?.description ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(values, others, bugs);
  const show = (f: keyof FormValues) => (submitted ? errors[f] : undefined);
  const set = (f: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [f]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Dados do produto" className="grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="produto-nome" className={labelClass}>Nome</label>
        <input id="produto-nome" value={values.name} onChange={set("name")} aria-invalid={!!show("name")} aria-describedby={show("name") ? "produto-nome-erro" : undefined} className={`${inputClass} mt-1`} />
        <FieldError id="produto-nome-erro" message={show("name")} />
      </div>
      <div>
        <label htmlFor="produto-sku" className={labelClass}>SKU</label>
        <input id="produto-sku" placeholder="AAA-000" value={values.sku} onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value.toUpperCase() }))} aria-invalid={!!show("sku")} aria-describedby={show("sku") ? "produto-sku-erro" : undefined} className={`${inputClass} mt-1 font-mono`} />
        <FieldError id="produto-sku-erro" message={show("sku")} />
      </div>
      <div>
        <label htmlFor="produto-categoria" className={labelClass}>Categoria</label>
        <select id="produto-categoria" value={values.category} onChange={set("category")} aria-invalid={!!show("category")} aria-describedby={show("category") ? "produto-categoria-erro" : undefined} className={`${inputClass} mt-1`}>
          <option value="">Selecione…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError id="produto-categoria-erro" message={show("category")} />
      </div>
      <div>
        <label htmlFor="produto-preco" className={labelClass}>Preço (R$)</label>
        <input id="produto-preco" type="number" step="0.01" inputMode="decimal" value={values.price} onChange={set("price")} aria-invalid={!!show("price")} aria-describedby={show("price") ? "produto-preco-erro" : undefined} className={`${inputClass} mt-1`} />
        <FieldError id="produto-preco-erro" message={show("price")} />
      </div>
      <div>
        <label htmlFor="produto-estoque" className={labelClass}>Estoque</label>
        <input id="produto-estoque" type="number" step="1" min="0" inputMode="numeric" value={values.stock} onChange={set("stock")} aria-invalid={!!show("stock")} aria-describedby={show("stock") ? "produto-estoque-erro" : undefined} className={`${inputClass} mt-1`} />
        <FieldError id="produto-estoque-erro" message={show("stock")} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="produto-descricao" className={labelClass}>Descrição <span className="font-normal text-slate-500">(opcional)</span></label>
        <textarea id="produto-descricao" rows={3} value={values.description} onChange={set("description")} className={`${inputClass} mt-1`} />
      </div>
      <div className="flex gap-3 md:col-span-2">
        <Button
          type="submit"
          data-testid="save-product"
          onClick={(e) => {
            saveClicks++;
            // B20: com bug, o 2º, 5º, 8º… clique é ignorado.
            if (bugs && saveClicks % 3 === 2) e.preventDefault();
          }}
        >
          {submitLabel}
        </Button>
        <Link href="/produtos" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
