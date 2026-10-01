import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object da tela de login. Concentra os localizadores e as ações; as
 * asserções de regra de negócio ficam nos testes.
 */
export class LoginPage extends BasePage {
  readonly path = "/login";

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Usuário");
    this.passwordInput = page.getByLabel("Senha", { exact: true });
    this.rememberMeCheckbox = page.getByRole("checkbox", { name: "Lembrar-me" });
    this.submitButton = page.getByRole("button", { name: "Entrar" });
    this.errorMessage = page.getByTestId("login-error");
  }

  async login(username: string, password: string, options: { rememberMe?: boolean } = {}) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (options.rememberMe) await this.rememberMeCheckbox.check();
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorMessage).toHaveText(message);
  }
}
