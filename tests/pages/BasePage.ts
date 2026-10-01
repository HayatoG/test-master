import type { Page } from "@playwright/test";

/**
 * Base dos Page Objects: guarda a `page` e oferece ações comuns a todas as telas.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Caminho relativo ao baseURL configurado no playwright.config.ts. */
  abstract readonly path: string;

  async goto() {
    await this.page.goto(this.path);
  }

  /** Volta o site ao estado inicial (localStorage, sessão e Modo Bugs). */
  async resetState() {
    await this.page.goto("/reset");
    await this.page.getByRole("status").filter({ hasText: "Estado inicial restaurado." }).waitFor();
  }
}
