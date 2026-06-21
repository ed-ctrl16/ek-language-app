import { test, expect } from "@playwright/test";

// Iteration 1 E2E: the full onboarding → dashboard journey in deterministic
// test mode, driven entirely through the text path (no microphone). Asserts
// the stored dual-level gap renders, and captures screenshots for visual QA.
test("onboard a Returner and see the gap", async ({ page }) => {
  // No profile yet → the app sends you to onboarding.
  await page.goto("/?test=1");
  await expect(page).toHaveURL(/onboarding/);
  await expect(
    page.getByRole("heading", { name: /welcome to habla/i }),
  ).toBeVisible();

  // Niche: Returner.
  await page.getByTestId("niche-returner").click();

  // Background (defaults are fine; fill years).
  await page.fill("#years", "8");
  await page.getByTestId("background-next").click();

  // Diagnostic (text path).
  await page.fill("#cloze-0", "fui");
  await page.fill("#cloze-1", "viajaría");
  await page.fill("#cloze-2", "estés");
  await page.fill("#convo-0", "Fui al cine con amigos y descansé.");
  await page.fill("#convo-1", "Quiero hablar con la familia de mi pareja.");
  await page.getByTestId("diagnostic-next").click();

  // Goals & topics.
  await page.getByRole("button", { name: "travel" }).click();
  await page.getByRole("button", { name: "food" }).click();
  await page.getByTestId("goals-next").click();

  // First win.
  await page.fill("#firstwin", "Lo aprendí en la universidad y viví en España.");
  await page.getByTestId("firstwin-send").click();
  await expect(page.getByText(/that's the gap closing/i)).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/onboarding-firstwin.png",
    fullPage: true,
  });
  await page.getByTestId("finish").click();

  // Dashboard with the stored gap.
  await expect(page).toHaveURL(/localhost:\d+\/?(\?.*)?$/);
  await expect(page.getByText("You understand", { exact: true })).toBeVisible();
  await expect(page.getByText("You can say", { exact: true })).toBeVisible();
  // Medium confidence → hedged band labels (no false precision).
  await expect(page.getByText("around B2")).toBeVisible();
  await expect(page.getByText("around A2")).toBeVisible();

  await page.screenshot({
    path: "e2e/__screenshots__/dashboard.png",
    fullPage: true,
  });
});
