import { expect, PASSWORD, test } from "../fixtures";

test.describe("Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("standard_user entra e vê a área logada", async ({ page, loginPage }) => {
    await loginPage.login("standard_user", PASSWORD);

    await expect(page).toHaveURL(/\/area-logada$/);
    await expect(page.getByTestId("welcome-message")).toHaveText("Olá, Ana Souza!");
  });

  test("locked_user recebe mensagem de usuário bloqueado", async ({ page, loginPage }) => {
    await loginPage.login("locked_user", PASSWORD);

    await loginPage.expectError("Este usuário está bloqueado. Procure o administrador.");
    await expect(page).toHaveURL(/\/login/);
  });
});
