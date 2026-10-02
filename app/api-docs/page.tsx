import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { DEFAULT_PASSWORD } from "@/lib/seed/users";

export const metadata: Metadata = { title: "API pública" };

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  auth?: "Bearer" | "Bearer (admin)" | "Cookie";
  description: string;
  params?: string;
  responses: string;
  example?: string;
};

const GROUPS: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: "Autenticação",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/token",
        description: "Gera um token de API. O mesmo usuário recebe sempre o mesmo token.",
        params: '{ "username": "standard_user", "password": "qa@12345" }',
        responses: "200 token · 400 campos ausentes · 401 credenciais inválidas · 403 usuário bloqueado",
        example: `curl -X POST $BASE_URL/api/auth/token -H "Content-Type: application/json" -d '{"username":"admin","password":"${DEFAULT_PASSWORD}"}'`,
      },
      {
        method: "POST",
        path: "/api/auth/login",
        description: "Login usado pela tela de login. Grava o cookie de sessão qap_session.",
        params: '{ "username", "password", "remember": boolean }',
        responses: "200 · 400 · 401 · 403 bloqueado (slow_user demora 3s)",
      },
      { method: "POST", path: "/api/auth/logout", description: "Remove o cookie de sessão.", responses: "200" },
      { method: "GET", path: "/api/auth/me", auth: "Cookie", description: "Usuário da sessão atual.", responses: "200 · 401" },
    ],
  },
  {
    title: "Produtos",
    endpoints: [
      {
        method: "GET",
        path: "/api/products",
        description: "Lista o catálogo fixo (12 produtos).",
        params: "?page=1&size=20&category=Livros&q=texto",
        responses: "200 { data, page, size, total, totalPages } · 400 parâmetro inválido",
        example: "curl $BASE_URL/api/products?category=Livros",
      },
      { method: "GET", path: "/api/products/:id", description: "Detalhe de um produto.", responses: "200 · 400 id inválido · 404 não encontrado" },
      {
        method: "POST",
        path: "/api/products",
        auth: "Bearer",
        description: "Cria um produto. A API é stateless: o produto é validado e devolvido, mas não aparece em GETs seguintes.",
        params: '{ "name", "sku": "AAA-000", "category", "price": number > 0, "stock": inteiro >= 0, "description"? }',
        responses: "201 + header Location · 400 com details[] · 401 · 409 SKU duplicado",
        example: `curl -X POST $BASE_URL/api/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Caneca","sku":"CAS-999","category":"Casa","price":30,"stock":5}'`,
      },
      { method: "PUT", path: "/api/products/:id", auth: "Bearer", description: "Substitui todos os campos (stateless).", responses: "200 · 400 · 401 · 404 · 409" },
      { method: "DELETE", path: "/api/products/:id", auth: "Bearer (admin)", description: "Exclui um produto (stateless).", responses: "204 · 401 · 403 não é admin · 404" },
    ],
  },
  {
    title: "Usuários",
    endpoints: [
      { method: "GET", path: "/api/users", auth: "Bearer", description: "Lista os usuários de teste (sem senha).", responses: "200 · 401" },
      { method: "GET", path: "/api/users/:id", auth: "Bearer", description: "Detalhe de um usuário.", responses: "200 · 401 · 404" },
    ],
  },
  {
    title: "Loja",
    endpoints: [
      { method: "GET", path: "/api/shipping", description: "Cotação de frete pelo CEP (demora 500ms). 99999-999 = CEP inexistente.", params: "?cep=01310100", responses: "200 · 400 CEP inválido · 404 CEP não encontrado" },
      { method: "POST", path: "/api/coupons/validate", description: "Valida um cupom para um subtotal.", params: '{ "code": "QA10", "subtotal": 150 }', responses: "200 · 400 · 404 cupom inválido · 422 expirado ou abaixo do mínimo" },
      {
        method: "POST",
        path: "/api/orders",
        description: "Fecha um pedido recalculando preços, cupons e frete no servidor. Cartão 4000 0000 0000 0002 é sempre recusado.",
        params: '{ "items": [{ "productId", "qty" }], "coupons": [], "cep", "payment": { "method": "card" | "pix", "cardNumber"?, "installments"? } }',
        responses: "201 · 400 · 402 pagamento recusado · 409 estoque insuficiente",
      },
    ],
  },
  {
    title: "Utilidades para treino",
    endpoints: [
      { method: "GET", path: "/api/slow", description: "Responde depois do atraso pedido.", params: "?ms=3000 (0 a 8000)", responses: "200 · 400" },
      { method: "GET", path: "/api/flaky", description: "Falha com 500 em parte das chamadas, de propósito. Com seed o resultado fica determinístico.", params: "?failRate=0.5&seed=42", responses: "200 · 500 · 400" },
      { method: "GET", path: "/api/status/:code", description: "Devolve o status HTTP pedido (200–599). Também aceita POST, PUT e DELETE.", responses: "o próprio código", example: "curl -i $BASE_URL/api/status/418" },
      { method: "GET", path: "/api/table-rows", description: "Dados da tabela (137 registros).", params: "?page=1&size=10&sort=amount&order=desc&q=ana&status=ativo", responses: "200 · 400" },
      { method: "GET", path: "/api/health", description: "Verificação de disponibilidade.", responses: "200" },
      { method: "POST", path: "/api/reset", description: "Remove os cookies de sessão e do Modo Bugs.", responses: "200" },
    ],
  },
];

const METHOD_STYLE: Record<Endpoint["method"], string> = {
  GET: "bg-sky-100 text-sky-800",
  POST: "bg-emerald-100 text-emerald-800",
  PUT: "bg-amber-100 text-amber-800",
  DELETE: "bg-rose-100 text-rose-800",
};

export default function ApiDocsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="API pública"
        difficulty="médio"
        description="Endpoints REST com respostas JSON. Erros seguem o formato { error: { status, message, details? } }. Com o Modo Bugs, envie o cookie, ?bugs=on ou o header X-Bugs: on."
      />
      {GROUPS.map((group) => (
        <section key={group.title} aria-labelledby={`grupo-${group.title}`}>
          <h2 id={`grupo-${group.title}`} className="mb-3 text-lg font-semibold">
            {group.title}
          </h2>
          <ul className="space-y-3">
            {group.endpoints.map((ep) => (
              <li key={`${ep.method} ${ep.path}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${METHOD_STYLE[ep.method]}`}>{ep.method}</span>
                  <code className="font-mono text-sm">{ep.path}</code>
                  {ep.auth && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">auth: {ep.auth}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-700">{ep.description}</p>
                <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
                  {ep.params && (
                    <>
                      <dt className="text-slate-500">Entrada</dt>
                      <dd>
                        <code className="font-mono text-xs break-all">{ep.params}</code>
                      </dd>
                    </>
                  )}
                  <dt className="text-slate-500">Respostas</dt>
                  <dd>{ep.responses}</dd>
                </dl>
                {ep.example && <pre tabIndex={0} aria-label={`Exemplo de ${ep.method} ${ep.path}`} className="mt-3 overflow-x-auto rounded bg-ink p-3 font-mono text-xs text-slate-100">{ep.example}</pre>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
