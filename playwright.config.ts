import { defineConfig, devices } from "@playwright/test";

/**
 * BASE_URL define contra qual ambiente os testes rodam:
 *   - sem BASE_URL: sobe o app local (build de produção) em http://localhost:3000
 *   - BASE_URL=https://seu-app.vercel.app npx playwright test → roda contra a Vercel
 */
// `||` (e não `??`) porque o GitHub Actions passa string vazia quando base_url não é informado.
const baseURL = process.env.BASE_URL || "http://localhost:3000";
const useLocalServer = !process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Descomente para rodar em outros navegadores:
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: useLocalServer
    ? {
        command: "npm run build && npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      }
    : undefined,
});
