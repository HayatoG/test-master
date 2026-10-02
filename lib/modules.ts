export type Difficulty = "fácil" | "médio" | "difícil";

export type ModuleInfo = {
  slug: string;
  href: string;
  title: string;
  difficulty: Difficulty;
  summary: string;
  scenarios: string[];
  requiresLogin?: boolean;
  /** Outras rotas que pertencem ao módulo (para destacar o menu). */
  relatedPaths?: string[];
};

export const MODULES: readonly ModuleInfo[] = [
  {
    slug: "login",
    href: "/login",
    relatedPaths: ["/area-logada", "/admin", "/trocar-senha"],
    title: "Login e autenticação",
    difficulty: "fácil",
    summary: "Usuários fixos com comportamentos diferentes, rotas protegidas, lembrar-me e logout.",
    scenarios: [
      "Login com sucesso e logout",
      "Mensagens de erro: campos vazios, senha errada, usuário bloqueado",
      "slow_user: esperar o login de 3s sem usar waitForTimeout",
      "Acessar rota protegida deslogado e ser redirecionado com ?next=",
      "Reaproveitar a sessão com storageState",
    ],
  },
  {
    slug: "formularios",
    href: "/formularios",
    title: "Formulários",
    difficulty: "médio",
    summary: "Cadastro com validações, máscaras, campos condicionais e dois tipos de date picker.",
    scenarios: [
      "Validar e-mail, CPF, senha forte e confirmação de senha",
      "Campos condicionais (Pessoa Jurídica mostra CNPJ)",
      "Preencher o date picker customizado",
      "Testes orientados a dados com vários casos inválidos",
      "Erro do servidor: e-mail já cadastrado",
    ],
  },
  {
    slug: "produtos",
    href: "/produtos",
    title: "CRUD de produtos",
    difficulty: "médio",
    requiresLogin: true,
    summary: "Listar, criar, editar e excluir produtos com modal de confirmação e toasts.",
    scenarios: [
      "Fluxo completo: criar → editar → excluir",
      "Cancelar a exclusão no modal",
      "Validações: nome obrigatório, preço > 0, SKU único",
      "Persistência após recarregar a página",
      "Isolamento de testes com o reset",
    ],
  },
  {
    slug: "tabela",
    href: "/tabela",
    title: "Tabela de dados",
    difficulty: "médio",
    summary: "137 registros servidos pela API com ordenação, filtro, busca, paginação e seleção em massa.",
    scenarios: [
      "Validar a ordenação lendo todas as células",
      "Busca com debounce + waitForResponse",
      "Navegar até a última página (registros incompletos)",
      "Mockar a API com page.route(): lista vazia e erro 500",
      "Selecionar todos e arquivar em massa",
    ],
  },
  {
    slug: "loja",
    href: "/loja",
    relatedPaths: ["/carrinho", "/checkout", "/pedido"],
    title: "Carrinho e checkout",
    difficulty: "difícil",
    summary: "Loja, carrinho, cupons, frete por CEP e checkout em 3 etapas até o pedido confirmado. O checkout exige login.",
    scenarios: [
      "Somar itens e quantidades e conferir o total",
      "Cupons válidos, expirados e com valor mínimo",
      "Frete grátis exatamente em R$ 200,00 (valor-limite)",
      "Checkout completo com Page Objects",
      "Validação de cartão de crédito (Luhn)",
    ],
  },
  {
    slug: "dinamicos",
    href: "/dinamicos",
    title: "Elementos dinâmicos e esperas",
    difficulty: "médio",
    summary: "Conteúdo atrasado, spinners, botões que habilitam depois, elementos que somem e scroll infinito.",
    scenarios: [
      "Esperar conteúdo atrasado sem waitForTimeout",
      "Botão habilitado após 5 segundos",
      "Elemento que some sozinho",
      "Acelerar timers com page.clock",
      "Scroll infinito até o fim da lista",
    ],
  },
  {
    slug: "interacoes",
    href: "/interacoes",
    title: "Interações avançadas",
    difficulty: "difícil",
    summary: "Drag-and-drop, hover, menu de contexto, atalhos de teclado e sliders.",
    scenarios: [
      "Mover um card no Kanban com dragTo",
      "Reordenar uma lista com mouse.down/move/up",
      "Ler o tooltip após hover",
      "Clique com o botão direito e menu de contexto",
      "Atalhos de teclado e slider customizado",
    ],
  },
  {
    slug: "janelas",
    href: "/janelas",
    title: "Janelas e frames",
    difficulty: "difícil",
    summary: "Diálogos nativos, nova aba, popup, iframes aninhados e Shadow DOM.",
    scenarios: [
      "Aceitar/recusar confirm e responder prompt",
      "Capturar a nova aba com context.waitForEvent('page')",
      "Interagir dentro de iframe aninhado com frameLocator",
      "Preencher formulário dentro do Shadow DOM",
    ],
  },
  {
    slug: "arquivos",
    href: "/arquivos",
    title: "Upload e download",
    difficulty: "médio",
    summary: "Upload com validação de tipo e tamanho e downloads gerados no client e no servidor.",
    scenarios: [
      "Upload válido com setInputFiles",
      "Rejeitar tipo inválido e arquivo maior que 1 MB",
      "Upload a partir de buffer em memória",
      "Baixar o CSV e validar o conteúdo",
    ],
  },
  {
    slug: "api",
    href: "/api-docs",
    title: "API pública",
    difficulty: "médio",
    summary: "Endpoints REST com token, status variados, endpoint lento e endpoint instável.",
    scenarios: [
      "Obter token e criar produto (201)",
      "Validar 400, 401, 403 e 404",
      "Lidar com /api/flaky usando retries",
      "Interceptar e modificar respostas com route.fetch()",
    ],
  },
];
