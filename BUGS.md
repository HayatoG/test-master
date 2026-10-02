# Gabarito do Modo Bugs

> ⚠️ **Spoiler.** Este arquivo lista todos os bugs intencionais do QA Playground.
> Escreva seus testes primeiro, ligue o Modo Bugs e veja quantos sua suíte encontra.
> Só depois volte aqui para conferir.

## Como ligar

| Forma | Como |
|---|---|
| Interface | Interruptor **Modo Bugs** no topo de qualquer página |
| URL | Acrescente `?bugs=on` a qualquer página (`?bugs=off` desliga). O parâmetro grava o cookie `qap_bugs` e some da URL. |
| API | Envie o cookie `qap_bugs=on`, o query param `?bugs=on` ou o header `X-Bugs: on` |
| Playwright | `await context.addCookies([{ name: "qap_bugs", value: "on", url: baseURL }])` |

Com o modo **desligado**, nenhum dos comportamentos abaixo acontece. O reset (`/reset` ou `POST /api/reset`) também desliga o Modo Bugs.

Uma suíte bem escrita deve **passar com o modo desligado** e **falhar com ele ligado**, apontando cada um dos bugs.

## Resumo

| ID | Módulo | Bug | Tipo de teste que pega |
|---|---|---|---|
| B01 | Login | `locked_user` entra se "Lembrar-me" estiver marcado | Combinação de entradas |
| B02 | Login | Logout não invalida a sessão | Segurança / fluxo |
| B03 | Formulários | E-mail sem domínio de topo é aceito | Validação negativa |
| B04 | Formulários | CPF com dígito verificador errado é aceito | Validação negativa |
| B05 | Formulários | Confirmação de senha só compara o tamanho | Validação negativa |
| B06 | Formulários | Label "Telefone" aponta para o campo CPF | Acessibilidade / localizador |
| B07 | CRUD | Preço zero ou negativo é aceito | Valor-limite |
| B08 | CRUD | Editar salva no produto anterior da lista | Verificação de estado |
| B09 | Tabela | Ordenação por valor é alfabética | Verificação de ordenação |
| B10 | Tabela | Última página perde o último registro | Paginação / contagem |
| B11 | Tabela | Busca diferencia maiúsculas de minúsculas | Validação de busca |
| B12 | Carrinho | Último item adicionado conta como quantidade 1 | Cálculo |
| B13 | Carrinho | Mesmo cupom pode ser aplicado duas vezes | Regra de negócio |
| B14 | Checkout | Frete grátis não vale para exatamente R$ 200,00 | Valor-limite |
| B15 | Dinâmicos | Botão habilita 2s depois de a contagem chegar a zero | Espera / sincronização |
| B16 | Interações | Nova ordem da lista não é salva | Persistência |
| B17 | Arquivos | Limite de 1 MB calculado como 1.000.000 bytes | Valor-limite |
| B18 | API | `POST /api/products` responde 200 em vez de 201 | Teste de API (status) |
| B19 | API | `GET /api/products/:id` inexistente responde 200 `{}` | Teste de API (status) |
| B20 | CRUD | Botão "Salvar" ignora o 2º, 5º, 8º… clique | Fluxo repetido / intermitência |

---

## Detalhes

### B01 — Usuário bloqueado entra com "Lembrar-me"
- **Onde:** `/login` (e `POST /api/auth/login`)
- **Passos:** usuário `locked_user`, senha `qa@12345`, marque **Lembrar-me** e clique em **Entrar**.
- **Esperado:** mensagem "Este usuário está bloqueado. Procure o administrador." e continuar em `/login`.
- **Com bug:** o login funciona e redireciona para `/area-logada`.

### B02 — Logout não invalida a sessão
- **Onde:** botão **Sair** (`POST /api/auth/logout`)
- **Passos:** faça login, clique em **Sair** e depois acesse `/area-logada` diretamente.
- **Esperado:** redirecionar para `/login?next=%2Farea-logada`.
- **Com bug:** o cookie `qap_session` continua válido. Depois do clique em **Sair**, `/login` mostra "Você já está logado como…" e `/area-logada` abre normalmente.

### B03 — E-mail sem domínio de topo
- **Onde:** `/formularios`, campo **E-mail**
- **Passos:** digite `ana@qa` e saia do campo.
- **Esperado:** erro "E-mail inválido".
- **Com bug:** nenhum erro, e o cadastro é aceito.

### B04 — CPF com dígito verificador inválido
- **Onde:** `/formularios`, campo **CPF**
- **Passos:** digite `529.982.247-24` (o válido é `529.982.247-25`).
- **Esperado:** erro "CPF inválido".
- **Com bug:** qualquer CPF com 11 dígitos é aceito.

### B05 — Confirmação de senha só compara o tamanho
- **Onde:** `/formularios`, campos **Senha** e **Confirmar senha**
- **Passos:** senha `Forte@123`, confirmação `Forte@124`.
- **Esperado:** erro "As senhas não conferem".
- **Com bug:** aceito, porque as duas têm 9 caracteres.

### B06 — Label "Telefone" ligado ao campo errado
- **Onde:** `/formularios`
- **Sintoma:** o `<label>` "Telefone" passa a ter `for="cpf"`. `page.getByLabel("Telefone")` encontra o **CPF**, e o campo de telefone fica sem nome acessível.
- **Como aparece no teste:** preencher "Telefone" via `getByLabel` sobrescreve o CPF, e o envio falha com "Informe o telefone". Uma asserção como `expect(page.getByLabel("Telefone")).toHaveAttribute("type", "tel")` também denuncia.

### B07 — Preço zero ou negativo aceito
- **Onde:** `/produtos/novo` e `/produtos/:id/editar`
- **Passos:** preencha o produto com preço `-10` e salve.
- **Esperado:** erro "O preço deve ser maior que zero".
- **Com bug:** o produto é salvo com `-R$ 10,00` e aparece o toast de sucesso.

### B08 — Edição grava no produto anterior
- **Onde:** `/produtos/:id/editar`
- **Passos:** edite o nome do **Teclado Mecânico TKL** (id 2) e salve.
- **Esperado:** o teclado é atualizado.
- **Com bug:** o **Fone Bluetooth Pulse** (linha anterior) recebe os dados novos e o teclado fica igual. Se você editar o primeiro da lista, quem é alterado é o último.

### B09 — Ordenação por valor alfabética
- **Onde:** `/tabela` e `GET /api/table-rows?sort=amount`
- **Passos:** ordene pela coluna **Valor**.
- **Esperado:** ordem numérica crescente.
- **Com bug:** comparação como texto (`"1000.5"` vem antes de `"20.3"`).

### B10 — Última página incompleta
- **Onde:** `/tabela` e `GET /api/table-rows`
- **Passos:** vá para a **Última** página com 10 itens por página.
- **Esperado:** 7 registros (131–137), como diz o resumo "Mostrando 131–137 de 137 registros".
- **Com bug:** só 6 linhas, e o registro 137 nunca aparece.

### B11 — Busca diferencia maiúsculas de minúsculas
- **Onde:** `/tabela` e `GET /api/table-rows?q=`
- **Passos:** busque `curitiba`.
- **Esperado:** os registros de Curitiba.
- **Com bug:** "Nenhum registro encontrado". Só `Curitiba` funciona.

### B12 — Último item adicionado conta como 1
- **Onde:** `/carrinho`, `/checkout` e `POST /api/orders`
- **Condição:** 2 ou mais produtos diferentes no carrinho.
- **Passos:** adicione 1 Mouse Sem Fio Glide e depois 3 Bonés Clássicos.
- **Esperado:** subtotal R$ 239,90.
- **Com bug:** subtotal R$ 139,90. O total da linha do boné mostra R$ 150,00, mas o resumo soma só R$ 50,00.

### B13 — Cupom aplicado duas vezes
- **Onde:** `/carrinho`
- **Passos:** aplique `QA10` e aplique `QA10` de novo.
- **Esperado:** mensagem "Este cupom já foi aplicado".
- **Com bug:** o cupom entra duas vezes na lista e o desconto vira 20%.

### B14 — Frete grátis no valor-limite
- **Onde:** `/carrinho`, `/checkout` e `POST /api/orders`
- **Passos:** coloque exatamente 4 Bonés Clássicos (R$ 200,00) e calcule o frete para `01310-100`.
- **Esperado:** frete "Grátis" (a regra é subtotal **≥** R$ 200,00).
- **Com bug:** cobra R$ 15,90. A dica "Você ganhou frete grátis!" continua aparecendo, o que é outra pista.

### B15 — Botão habilita atrasado
- **Onde:** `/dinamicos`, seção "Botão habilitado após 5 segundos"
- **Passos:** clique em **Iniciar contagem** e espere chegar em "Pronto!".
- **Esperado:** **Confirmar** habilitado assim que aparece "Pronto!".
- **Com bug:** o botão só habilita 2 segundos depois. Um teste que espera o texto "Pronto!" e logo clica, ou que usa `page.clock.runFor(5000)`, falha.

### B16 — Ordem da lista não é persistida
- **Onde:** `/interacoes`, "Lista ordenável"
- **Passos:** arraste **Publicar** para o topo e recarregue a página.
- **Esperado:** **Publicar** continua no topo.
- **Com bug:** a tela mostra a nova ordem, mas após o reload a ordem volta à anterior.

### B17 — Limite de upload de 1.000.000 bytes
- **Onde:** `/arquivos`, "Upload simples" e "Upload múltiplo"
- **Passos:** envie um PDF de 1.010.000 bytes, por exemplo `setInputFiles({ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(1_010_000) })`.
- **Esperado:** aceito, porque o limite é 1 MB = 1.048.576 bytes.
- **Com bug:** "O arquivo excede o limite de 1 MB". A API `/api/upload` continua correta, então só o client está errado.

### B18 — Status 200 na criação
- **Onde:** `POST /api/products`
- **Esperado:** `201 Created` com header `Location`.
- **Com bug:** `200 OK` (o corpo continua correto).

### B19 — Recurso inexistente responde 200
- **Onde:** `GET /api/products/9999`
- **Esperado:** `404` com `{ "error": { "status": 404, "message": "Produto não encontrado" } }`.
- **Com bug:** `200` com corpo `{}`.

### B20 — Clique em "Salvar" ignorado
- **Onde:** botão **Salvar** / **Salvar alterações** do CRUD
- **Comportamento:** os cliques em Salvar (inclusive os que só mostram erros de validação) são contados desde o carregamento da página. Com o bug, o 2º, 5º, 8º… clique não faz nada.
- **Como aparece:** um teste que cria dois produtos seguidos navegando pelos links (sem `page.goto`, que recarrega a página e zera o contador) trava no segundo, que não sai de `/produtos/novo`. O mesmo acontece com um teste que clica em Salvar com o formulário vazio, corrige os campos e clica de novo. É o tipo de falha que parece "flaky", mas é determinística.
