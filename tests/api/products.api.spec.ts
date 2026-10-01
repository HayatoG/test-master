import { expect, test } from "@playwright/test";

/**
 * Teste de API puro: usa a fixture `request` (sem navegador).
 * O baseURL do playwright.config.ts também vale aqui.
 */
test("cria produto com token e recebe 201", async ({ request }) => {
  const auth = await request.post("/api/auth/token", {
    data: { username: "standard_user", password: "qa@12345" },
  });
  expect(auth.status()).toBe(200);
  const { token } = await auth.json();

  const response = await request.post("/api/products", {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: "Caneca QA", sku: "CAS-900", category: "Casa", price: 39.9, stock: 10 },
  });

  expect(response.status()).toBe(201);
  expect(response.headers()["location"]).toMatch(/^\/api\/products\/\d+$/);
  expect(await response.json()).toMatchObject({ name: "Caneca QA", sku: "CAS-900", price: 39.9 });
});
