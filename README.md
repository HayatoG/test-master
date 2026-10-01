# QA Playground

Site de treino para automação de testes E2E com Playwright.

> Documentação completa em construção. Veja a página inicial do site para a lista de módulos.

## Rodar local

```bash
npm install
npm run dev          # http://localhost:3000
```

## Rodar os testes

```bash
npx playwright install chromium
npm test                                         # sobe o app local automaticamente
BASE_URL=https://seu-app.vercel.app npm test     # roda contra um deploy
```
