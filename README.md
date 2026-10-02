# QA Playground

Site de treino para automação de testes E2E com **Playwright**. Ele cobre os cenários que mais aparecem em testes técnicos de QA e no dia a dia: login, formulários, CRUD, tabelas, carrinho/checkout, esperas, drag-and-drop, iframes, Shadow DOM, upload/download e testes de API, com dificuldade progressiva.

Tem também um **Modo Bugs**: um interruptor que insere 20 defeitos intencionais no site. Depois de escrever sua suíte, ligue o modo e veja quantos ela encontra.

- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Infra:** Vercel (plano Hobby). Sem banco de dados e sem serviços pagos.
- **Testes:** Playwright, já configurado em [`playwright.config.ts`](playwright.config.ts) e [`tests/`](tests/)

---

## Sumário

1. [Rodar localmente](#rodar-localmente)
2. [Rodar os testes](#rodar-os-testes)
3. [Usuários de teste](#usuários-de-teste)
4. [Estado, isolamento e reset](#estado-isolamento-e-reset)
5. [Modo Bugs](#modo-bugs)
6. [Módulos](#módulos)
7. [Desafios sugeridos](#desafios-sugeridos)
8. [Dados úteis para os testes](#dados-úteis-para-os-testes)
9. [Dicas e pegadinhas](#dicas-e-pegadinhas)
10. [Estrutura do projeto](#estrutura-do-projeto)
11. [Deploy na Vercel](#deploy-na-vercel)

---

## Rodar localmente

Pré-requisito: Node.js 20.9 ou superior.

```bash
npm install
npm run dev        # http://localhost:3000 (modo desenvolvimento)
```

Para rodar a versão de produção (mais rápida e igual à da Vercel):

```bash
npm run build
npm start
```

Outros scripts: `npm run lint` e `npm run typecheck`.

## Rodar os testes

```bash
npx playwright install chromium   # só na primeira vez

npm test                          # roda tudo; sobe o app local automaticamente
npm run test:ui                   # modo UI (ótimo para depurar e escolher localizadores)
npm run test:report               # abre o último relatório HTML
npx playwright codegen localhost:3000   # grava ações e sugere localizadores
```

### Local × Vercel

O `baseURL` vem da variável de ambiente `BASE_URL`:

| Comando | Contra o quê roda |
|---|---|
| `npm test` | App local. O Playwright faz `npm run build && npm start` sozinho, ou reaproveita um servidor que já esteja em `localhost:3000`. |
| `BASE_URL=https://seu-app.vercel.app npm test` | O deploy na Vercel. Nenhum servidor local é iniciado. |

### GitHub Actions

O workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) roda a cada push na `main` e em pull requests. Ele faz o build, roda os testes no Chromium e publica o relatório HTML como artefato **playwright-report** (aba *Actions* → execução → *Artifacts*).

Para rodar contra a Vercel pelo GitHub: *Actions* → **Playwright** → **Run workflow** → preencha `base_url`.

> As URLs de *preview* da Vercel vêm com proteção (Vercel Authentication) no plano Hobby, e os testes vão parar numa tela de login da Vercel. Use a URL de **produção** ou desligue a proteção em *Project Settings → Deployment Protection*.

### O que já vem pronto

Só três testes de exemplo. O resto é com você.

| Arquivo | O que mostra |
|---|---|
| [`tests/e2e/login.spec.ts`](tests/e2e/login.spec.ts) | Login com sucesso e usuário bloqueado usando Page Object + fixture |
| [`tests/api/products.api.spec.ts`](tests/api/products.api.spec.ts) | Teste de API puro com a fixture `request` (token + criação → 201) |
| [`tests/pages/LoginPage.ts`](tests/pages/LoginPage.ts) | Exemplo de Page Object Model |
| [`tests/fixtures/index.ts`](tests/fixtures/index.ts) | Fixture customizada que injeta os Page Objects nos testes |
| [`tests/files/`](tests/files/) | Arquivos para os testes de upload (PNG, PDF, CSV e um `.exe` falso) |

Para criar um Page Object novo: crie a classe em `tests/pages/` estendendo `BasePage`, registre-a em `tests/fixtures/index.ts` e importe `test` de `../fixtures` nos specs.

## Usuários de teste

Senha de todos: **`qa@12345`**

| Usuário | Perfil | Comportamento |
|---|---|---|
| `standard_user` | user | Login normal |
| `locked_user` | user | Bloqueado: "Este usuário está bloqueado. Procure o administrador." |
| `slow_user` | user | O login demora 3 segundos |
| `admin` | admin | Acessa `/admin` e pode excluir produtos na API |
| `expired_user` | user | Após o login, precisa trocar a senha em `/trocar-senha` |

Rotas protegidas (sem sessão redirecionam para `/login?next=...`): `/area-logada`, `/admin`, `/produtos`, `/checkout`, `/pedido` e `/trocar-senha`.

## Estado, isolamento e reset

A Vercel gratuita não guarda estado entre requisições, então:

- **Sessão:** cookie `qap_session` (httpOnly, assinado com HMAC). Com **Lembrar-me** ele dura 30 dias; sem a opção, é cookie de sessão.
- **Dados editáveis** (produtos do CRUD, carrinho, pedidos, Kanban, lista ordenável): `localStorage`, com chaves que começam em `qap:`.
- **APIs:** dados *seed* fixos no código. A mesma requisição sempre gera a mesma resposta. As mutações da API (`POST/PUT/DELETE /api/products`) são **stateless**: validam e respondem como se tivessem salvo, mas nada persiste.

Cada teste do Playwright já começa com um contexto de navegador limpo (sem cookies e sem localStorage), então os testes são isolados por padrão. Para voltar ao estado inicial **dentro** de um teste:

| Forma | Efeito |
|---|---|
| Botão **Resetar estado** no topo | Limpa tudo e recarrega a página atual |
| `page.goto("/reset")` | Limpa tudo e mostra "Estado inicial restaurado." |
| `page.goto("/reset?next=/produtos")` | Limpa tudo e redireciona |
| `POST /api/reset` | Remove os cookies de sessão e do Modo Bugs (não mexe no localStorage) |

## Modo Bugs

Liga 20 bugs intencionais espalhados pelos módulos.

- Interruptor **Modo Bugs** no topo, ou `?bugs=on` / `?bugs=off` em qualquer URL
- Na API: cookie `qap_bugs=on`, `?bugs=on` ou header `X-Bugs: on`
- Quando ativo, aparece uma faixa vermelha "Modo Bugs ativo" no topo

Fluxo sugerido:

1. Escreva os testes com o modo **desligado**. Eles devem passar.
2. Rode a mesma suíte com o modo **ligado**. Uma forma simples é um projeto extra no `playwright.config.ts` com o cookie (troque `domain` se testar contra a Vercel):
   ```ts
   {
     name: "chromium-bugs",
     use: {
       ...devices["Desktop Chrome"],
       storageState: { cookies: [{ name: "qap_bugs", value: "on", domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" }], origins: [] },
     },
   }
   ```
3. Confira quais testes falharam e compare com o gabarito em **[BUGS.md](BUGS.md)**. *Não abra antes de tentar!*

## Módulos

| Módulo | Rota | Nível | Resumo |
|---|---|---|---|
| Login e autenticação | `/login` | fácil | Usuários com comportamentos diferentes, rotas protegidas, lembrar-me, logout, admin (403) e troca de senha |
| Formulários | `/formularios` | médio | Cadastro com e-mail, CPF, telefone (máscaras), senha forte com checklist, confirmação, select, radio, checkbox, date picker nativo e customizado, campos condicionais (PJ) e erro 409 |
| CRUD de produtos | `/produtos` | médio | Listar, criar, editar e excluir com modal de confirmação e toasts. Exige login. |
| Tabela de dados | `/tabela` | médio | 137 registros via `GET /api/table-rows`: ordenação, filtro, busca com debounce, paginação, seleção em massa e filtros na URL |
| Carrinho e checkout | `/loja` | difícil | Carrinho, cupons, frete por CEP, frete grátis ≥ R$ 200, checkout em 3 etapas (endereço, pagamento, revisão) e pedido confirmado. O checkout exige login. |
| Elementos dinâmicos | `/dinamicos` | médio | Conteúdo atrasado, API lenta, botão que habilita após 5s, notificação que some, status que muda, barra de progresso, oculto × removido e scroll infinito |
| Interações avançadas | `/interacoes` | difícil | Kanban (drag-and-drop HTML5), lista ordenável (pointer events), tooltip, menu no hover, menu de contexto, atalhos (Ctrl/⌘+K), listbox por teclado, sliders e duplo clique |
| Janelas e frames | `/janelas` | difícil | `alert`/`confirm`/`prompt`, nova aba, popup, iframe, iframe aninhado e Shadow DOM (simples e aninhado) |
| Upload e download | `/arquivos` | médio | Upload simples, múltiplo e por arrastar, com validação de tipo (PNG, JPG, PDF, CSV) e tamanho (1 MB). Downloads gerados no navegador e no servidor. |
| API pública | `/api-docs` | médio | REST com token Bearer, status 200/201/204/400/401/403/404/409/415/422/500, endpoint lento e endpoint instável |

## Desafios sugeridos

Os níveis são 🟢 fácil, 🟡 médio e 🔴 difícil.

### Login
- 🟢 Login com `standard_user` e verificação do nome na área logada.
- 🟢 Mensagens de erro: campos vazios, senha errada, `locked_user`.
- 🟡 `slow_user`: validar o estado "Entrando…" e esperar o redirect **sem** `waitForTimeout`.
- 🟡 Acessar `/produtos` deslogado, verificar o redirect com `?next=` e voltar para `/produtos` após o login.
- 🟡 "Lembrar-me": verificar a expiração do cookie com `context.cookies()` e o usuário pré-preenchido no próximo acesso.
- 🟡 `standard_user` em `/admin` vê 403; `admin` vê a tabela de usuários.
- 🔴 Criar um *setup project* que faz login uma vez e salva o `storageState` para os outros testes.
- 🔴 `expired_user`: fluxo completo de troca de senha.

### Formulários
- 🟢 Cadastro válido completo e verificação do resumo.
- 🟡 Testes orientados a dados: uma lista de e-mails/CPFs inválidos com a mensagem esperada para cada um (`for...of` gerando um `test` por caso).
- 🟡 Checklist da senha forte: cada requisito muda de estado conforme a digitação.
- 🟡 Pessoa Jurídica mostra CNPJ e razão social; Pessoa Física esconde.
- 🟡 Submit vazio: contagem de erros no resumo e foco no primeiro campo inválido.
- 🔴 Date picker customizado: navegar meses e escolher uma data. Use `page.clock.setFixedTime()` para deixar o teste determinístico.
- 🔴 Erro do servidor (`existente@qa.com`) e simulação de erro 500 com `page.route()`.

### CRUD de produtos
- 🟢 Criar um produto e encontrá-lo na tabela.
- 🟡 Editar e verificar a mudança; recarregar a página e verificar a persistência.
- 🟡 Excluir: cancelar no modal (nada muda), fechar com Esc e confirmar.
- 🟡 Validações: SKU duplicado, formato do SKU, preço ≤ 0, estoque negativo.
- 🔴 Criar um `ProductsPage` (POM) com métodos `create`, `edit`, `delete` e `rowByName`.

### Tabela de dados
- 🟡 Ordenar por cada coluna e validar a ordem lendo todas as células.
- 🟡 Busca com debounce: usar `waitForResponse` em vez de esperas fixas.
- 🟡 Paginação: navegar até a última página e conferir o resumo "Mostrando X–Y de 137".
- 🟡 Abrir a página já filtrada pela URL (`/tabela?status=pendente&sort=amount&order=desc`).
- 🔴 `page.route()`: mockar lista vazia, erro 500 (e o botão "Tentar novamente") e uma resposta com 3 registros fixos.
- 🔴 Validar a API e a UI juntas: os dados exibidos batem com o JSON de `/api/table-rows`?

### Carrinho e checkout
- 🟢 Adicionar produtos e conferir o badge do carrinho.
- 🟡 Cálculo: subtotal, desconto, frete e total para várias combinações.
- 🟡 Cupons: `QA10`, `FRETEGRATIS`, `MINIMO100` (abaixo e acima de R$ 100), `EXPIRADO`, inválido e repetido.
- 🔴 Valores-limite do frete grátis: R$ 199,99 × R$ 200,00 × R$ 200,01.
- 🔴 Checkout completo com Page Objects: endereço → cartão → revisão → pedido confirmado.
- 🔴 Cartão recusado (402), cartão inválido (Luhn), validade vencida, Pix.
- 🔴 Testar a regra de cálculo direto na API (`POST /api/orders`) e comparar com a UI.

### Elementos dinâmicos
- 🟢 Conteúdo que aparece depois de 2s.
- 🟡 Botão que habilita depois de 5s: `toBeEnabled` com timeout **ou** `page.clock`.
- 🟡 Notificação que aparece e some sozinha (`toBeVisible` e depois `toBeHidden`).
- 🟡 Oculto × removido: `toBeHidden` × `not.toBeAttached`.
- 🔴 Scroll infinito até "Fim da lista" (`mouse.wheel`, `expect.poll` ou `toPass`).
- 🔴 Acelerar todos os timers com `page.clock.install()` + `runFor()`.

### Interações avançadas
- 🟡 Mover um cartão no Kanban com `dragTo` e verificar a coluna de destino.
- 🔴 Reordenar a lista com `mouse.down()` / `mouse.move()` / `mouse.up()` e verificar após o reload.
- 🟡 Tooltip: `hover()` e asserção no `role=tooltip`.
- 🟡 Menu de contexto: `click({ button: "right" })`.
- 🟡 Atalhos: `keyboard.press("ControlOrMeta+K")`, listbox com setas e Enter.
- 🟡 Sliders: `fill()` no range nativo; teclado e clique no slider customizado.

### Janelas e frames
- 🟡 `alert`, `confirm` (aceitar e recusar) e `prompt` com resposta, usando `page.on("dialog")`/`page.once`.
- 🟡 Nova aba com `context.waitForEvent("page")` e popup com `page.waitForEvent("popup")`.
- 🟡 Iframe simples com `frameLocator`.
- 🔴 Iframe dentro de iframe.
- 🔴 Shadow DOM: formulário e botão aninhado em dois shadow roots.

### Upload e download
- 🟢 Upload de `tests/files/imagem.png` e verificação da pré-visualização.
- 🟡 Rejeitar `programa.exe` e um arquivo maior que 1 MB criado em memória (`buffer`).
- 🟡 Valor-limite: exatamente 1.048.576 bytes deve passar.
- 🟡 Upload múltiplo com mais de 5 arquivos.
- 🔴 Baixar o CSV e validar o conteúdo do arquivo (`download.path()`).

### API pública
- 🟢 `GET /api/products` e validação do formato da resposta.
- 🟡 Fluxo com token: obter → criar (201) → validar `Location`.
- 🟡 Matriz de erros: 400, 401 (sem token e token inválido), 403 (DELETE sem ser admin), 404, 409.
- 🔴 `/api/flaky`: lidar com instabilidade (retries, `expect.poll`, `toPass`) e usar `?seed=` para tornar o teste determinístico.
- 🔴 `route.fetch()`: pegar a resposta real de `/api/table-rows` e alterar um campo antes de entregar à página.

## Dados úteis para os testes

| O quê | Valor |
|---|---|
| CPF válido | `529.982.247-25` |
| CPF inválido | `529.982.247-24` |
| CNPJ válido | `11.222.333/0001-81` |
| E-mail que já existe | `existente@qa.com` |
| Cartão aprovado | `4111 1111 1111 1111` |
| Cartão recusado (402) | `4000 0000 0000 0002` |
| Cupons | `QA10` (10%), `FRETEGRATIS`, `MINIMO100` (15% a partir de R$ 100), `EXPIRADO` |
| CEPs | `01310-100` Sudeste R$ 15,90 · `40000-000` Nordeste R$ 29,90 · `80010-000` Sul R$ 19,90 · `99999-999` não encontrado |
| Produto para valor-limite | Boné Clássico, R$ 50,00 (2 = R$ 100, 4 = R$ 200) |
| Produto esgotado | Tapete de Yoga |

## Dicas e pegadinhas

- **`getByRole("alert")` encontra 2 elementos.** O Next.js insere um anunciador de rotas invisível (`#__next-route-announcer__`) com `role="alert"`. Filtre por texto (`.filter({ hasText })`) ou use um localizador mais específico.
- **`getByLabel` busca por substring e ignora maiúsculas.** `getByLabel("Senha")` também encontra "Confirmar senha"; use `{ exact: true }`.
- **Botões repetidos.** Na loja, todo card tem "Adicionar ao carrinho"; no CRUD, toda linha tem "Editar" e "Excluir". Restrinja o escopo: `page.getByRole("article", { name: "Boné Clássico" }).getByRole("button")` ou `page.getByRole("row", { name: /Teclado/ }).getByRole("button", { name: "Excluir" })`.
- **Nem tudo tem `data-testid`.** De propósito. Prefira `getByRole`, `getByLabel` e `getByText`; use `getByTestId` só quando não houver nome acessível.
- **Telas que leem o localStorage** mostram um spinner até carregar. Espere o conteúdo, não um tempo fixo.
- **Toasts somem em 4 segundos.** Faça a asserção logo depois da ação.
- **API stateless.** Um produto criado via `POST /api/products` não aparece no `GET` seguinte. Isso é esperado e está documentado.

## Estrutura do projeto

```
app/                  páginas (App Router) e rotas de API (app/api/**/route.ts)
components/           layout (Header, Sidebar…) e componentes de UI (Button, Modal, Toast…)
lib/
  auth/               sessão assinada (HMAC) e cookies
  bugs/               registro do Modo Bugs
  domain/             regras puras: carrinho, frete, validadores, máscaras, tabela, arquivos
  seed/               dados fixos: usuários, produtos, cupons, 137 registros (PRNG com semente)
  storage/            hook useLocalStore (localStorage sincronizado)
proxy.ts              rotas protegidas e captura de ?bugs=on|off
tests/                specs, Page Objects, fixtures e arquivos de exemplo
BUGS.md               gabarito do Modo Bugs
```

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new). O framework (Next.js) é detectado sozinho.
2. Em *Settings → Environment Variables*, crie `SESSION_SECRET` com um valor aleatório (por exemplo, `openssl rand -hex 32`). Sem ela, o app usa um segredo padrão, o que é aceitável para treino mas não recomendado.
3. Cada push na `main` gera um novo deploy de produção.

O app não usa banco de dados nem serviços pagos e cabe no plano Hobby. O upload aceita no máximo 1 MB, bem abaixo do limite de 4,5 MB por requisição da Vercel, e `/api/slow` tem teto de 8 segundos.
