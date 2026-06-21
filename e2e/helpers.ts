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

// --- In-session exercise completion helpers (end by clicking the block's
// "Continue" button, which advances the SessionPlayer). Block order is
// randomized, so the session spec detects which block is showing. ---

async function warmupProgress(page: Page): Promise<number> {
  const t = await page
    .getByTestId("warmup-progress")
    .textContent()
    .catch(() => null);
  const m = t?.match(/·\s*(\d+)\s*of/);
  return m ? Number(m[1]) : -1;
}

export async function completeWarmupInSession(page: Page): Promise<void> {
  const cont = page.getByTestId("warmup-continue");
  for (let i = 0; i < 8; i++) {
    if (await cont.isVisible().catch(() => false)) break;
    const known = page.getByTestId("warmup-known");
    if (!(await known.isVisible().catch(() => false))) break;
    const idx = await warmupProgress(page);
    await known.click();
    await expect
      .poll(
        async () =>
          (await cont.isVisible().catch(() => false)) ||
          (await warmupProgress(page)) > idx,
      )
      .toBe(true);
  }
  await cont.click();
}

export async function completeBridgeInSession(page: Page): Promise<void> {
  await page.getByTestId("bridge-understood").click();
  await page.fill("#bridge-answer", "Cuando era niño vivía en Madrid");
  await page.getByTestId("bridge-check").click();
  await page.getByTestId("bridge-next").click();
  await page.fill("#bridge-answer", "vivía");
  await page.getByTestId("bridge-check").click();
  await page.getByTestId("bridge-next").click();
  for (const word of ["Cuando", "era", "niño,", "vivía", "en", "Bristol."]) {
    await page.getByRole("button", { name: word, exact: true }).click();
  }
  await page.getByTestId("bridge-check").click();
  await page.getByTestId("bridge-next").click();
  await page.fill("#bridge-answer", "Cuando era niño vivía cerca del mar");
  await page.getByTestId("bridge-submit").click();
  await page.getByTestId("bridge-finish").click();
  await page.getByTestId("bridge-continue").click();
}

export async function completeConversationInSession(page: Page): Promise<void> {
  await page.fill("#conv-input", "voy a llegar tarde, lo siento");
  await page.getByTestId("conv-send").click();
  await page.getByTestId("conv-finish").click();
  await page.getByTestId("conv-continue").click();
}
