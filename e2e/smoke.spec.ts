import { test, expect } from "@playwright/test";

// Iteration 0 smoke E2E: the app boots in deterministic test mode, the shell
// and the gap visual render, and a screenshot is captured for visual review
// against the design system (UI_UX_PLAN §8). No microphone involved.
test("dashboard shell renders in test mode", async ({ page }) => {
  await page.goto("/?test=1");

  // App shell + hero.
  await expect(
    page.getByRole("heading", { name: /hola otra vez/i }),
  ).toBeVisible();

  // Primary action: today's session card.
  await expect(page.getByTestId("today-session")).toBeVisible();

  // The headline gap visual.
  await expect(page.getByText(/you understand/i)).toBeVisible();
  await expect(page.getByText(/you can say/i)).toBeVisible();

  await page.screenshot({
    path: "e2e/__screenshots__/dashboard.png",
    fullPage: true,
  });
});
