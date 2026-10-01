import { expect, test } from "@playwright/test";

test("home lista os módulos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "QA Playground" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Módulos" }).getByRole("link")).toHaveCount(11);
});
