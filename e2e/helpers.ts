import { expect, type Page } from "@playwright/test";

/**
 * Drive a Returner through onboarding via the text path (deterministic test
 * mode). Leaves the page on the dashboard. Shared by the journey specs.
 */
export async function onboardReturner(page: Page): Promise<void> {
  await page.goto("/?test=1");
  await expect(page).toHaveURL(/onboarding/);

  await page.getByTestId("niche-returner").click();

  await page.fill("#years", "8");
  await page.getByTestId("background-next").click();

  await page.fill("#cloze-0", "fui");
  await page.fill("#cloze-1", "viajaría");
  await page.fill("#cloze-2", "estés");
  await page.fill("#convo-0", "Fui al cine con amigos.");
  await page.fill("#convo-1", "Quiero hablar con la familia de mi pareja.");
  await page.getByTestId("diagnostic-next").click();

  await page.getByRole("button", { name: "travel" }).click();
  await page.getByTestId("goals-next").click();

  await page.fill("#firstwin", "Lo aprendí en la universidad y viví en España.");
  await page.getByTestId("firstwin-send").click();
  await expect(page.getByText(/that's the gap closing/i)).toBeVisible();
  await page.getByTestId("finish").click();

  await expect(page.getByText("You understand", { exact: true })).toBeVisible();
}
