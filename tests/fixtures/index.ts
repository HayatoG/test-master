import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

/**
 * Fixtures customizadas: cada teste recebe os Page Objects já instanciados.
 * Para adicionar um novo Page Object, crie a classe em tests/pages e
 * registre-a aqui.
 */
type Pages = {
  loginPage: LoginPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from "@playwright/test";

/** Senha comum a todos os usuários de teste. */
export const PASSWORD = "qa@12345";
