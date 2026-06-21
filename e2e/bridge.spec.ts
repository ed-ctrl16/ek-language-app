import { test, expect } from "@playwright/test";
import { onboardReturner } from "./helpers";

// Bridge Drill journey (text path): Hear → Repeat → Mod (with a stuck-ladder
// detour) → Make. Proves the signature mechanic and the stuck protocol end to end.
test("complete a bridge drill, using the stuck protocol", async ({ page }) => {
  await onboardReturner(page);

  await page.getByTestId("bridge-link").click();
  await expect(page.getByRole("heading", { name: "Bridge Drill" })).toBeVisible();

  // Hear it.
  await expect(page.getByText(/cuando era niño/i)).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/bridge-hear.png",
    fullPage: true,
  });
  await page.getByTestId("bridge-understood").click();

  // Repeat it.
  await page.fill("#bridge-answer", "Cuando era niño vivía en Madrid");
  await page.getByTestId("bridge-check").click();
  await page.getByTestId("bridge-next").click();

  // Mod it — wrong answer triggers the stuck ladder, then recover.
  await page.fill("#bridge-answer", "viví");
  await page.getByTestId("bridge-check").click();
  await expect(page.getByText(/not quite/i)).toBeVisible();

  await page.getByTestId("bridge-hint").click(); // "wait" rung
  await expect(page.getByTestId("bridge-hint-body")).toBeVisible();
  await page.getByTestId("bridge-hint").click(); // "first-word" rung
  await expect(page.getByTestId("bridge-hint-body")).toContainText(/starts with/i);
  await page.screenshot({
    path: "e2e/__screenshots__/bridge-mod-stuck.png",
    fullPage: true,
  });

  await page.fill("#bridge-answer", "vivía");
  await page.getByTestId("bridge-check").click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await page.getByTestId("bridge-next").click();

  // Mix it — assemble the model sentence from scrambled chunks, in order.
  for (const word of ["Cuando", "era", "niño,", "vivía", "en", "Bristol."]) {
    await page.getByRole("button", { name: word, exact: true }).click();
  }
  await page.screenshot({
    path: "e2e/__screenshots__/bridge-mix.png",
    fullPage: true,
  });
  await page.getByTestId("bridge-check").click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await page.getByTestId("bridge-next").click();

  // Make it — open production assessed by the AI seam.
  await page.fill("#bridge-answer", "Cuando era niño vivía cerca del mar");
  await page.getByTestId("bridge-submit").click();
  await expect(page.getByText(/natural version/i)).toBeVisible();
  await page.getByTestId("bridge-finish").click();

  // Recap.
  await expect(page.getByTestId("bridge-recap")).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/bridge-recap.png",
    fullPage: true,
  });
});
