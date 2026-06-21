import { test, expect } from "@playwright/test";
import { onboardReturner } from "./helpers";

// Reactivation warm-up journey (text path): a wrong answer (reveals the target),
// then "I already know this" to fast-forward the rest, through to the recap.
test("complete a reactivation warm-up", async ({ page }) => {
  await onboardReturner(page);

  await page.getByTestId("warmup-link").click();
  await expect(
    page.getByRole("heading", { name: "Warm-up" }),
  ).toBeVisible();
  await expect(page.getByText(/fill the blank/i)).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/warmup-question.png",
    fullPage: true,
  });

  const recap = page.getByTestId("warmup-recap");

  // Buttons stay visible-but-disabled during the async save, so we sync on the
  // progress counter actually advancing (or the recap appearing) before the
  // next interaction — never clicking mid-transition.
  const progressIndex = async (): Promise<number> => {
    const t = await page.getByTestId("warmup-progress").textContent().catch(() => null);
    const m = t?.match(/·\s*(\d+)\s*of/);
    return m ? Number(m[1]) : -1;
  };
  const advancedPast = async (from: number): Promise<void> => {
    await expect
      .poll(async () => (await recap.isVisible().catch(() => false)) || (await progressIndex()) > from)
      .toBe(true);
  };

  // First item: "I already know this" (savings fast-forward).
  let idx = await progressIndex();
  await page.getByTestId("warmup-known").click();
  await advancedPast(idx);

  // Remaining items: a deliberately wrong answer reveals the target, then Next.
  for (let i = 0; i < 8; i++) {
    if (await recap.isVisible().catch(() => false)) break;
    idx = await progressIndex();
    await page.fill("#warmup-answer", "zzzqqq");
    await page.getByTestId("warmup-check").click();
    await expect(page.getByText(/not quite/i)).toBeVisible();
    await page.getByTestId("warmup-next").click();
    await advancedPast(idx);
  }

  await expect(recap).toBeVisible();
  await expect(page.getByTestId("warmup-recap")).toContainText(/reactivated/i);
  await page.screenshot({
    path: "e2e/__screenshots__/warmup-recap.png",
    fullPage: true,
  });
});
