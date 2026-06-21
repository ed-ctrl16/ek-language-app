import { test, expect } from "@playwright/test";
import {
  completeBridgeInSession,
  completeConversationInSession,
  completeWarmupInSession,
  onboardReturner,
} from "./helpers";

// The whole daily loop: onboard → start session → complete every block (in
// whatever order the orchestrator interleaved them) → session recap + streak.
test("complete the full daily session", async ({ page }) => {
  await onboardReturner(page);

  await page.getByTestId("session-link").click();
  await expect(page.getByTestId("session-progress")).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/session-start.png",
    fullPage: true,
  });

  const recap = page.getByTestId("session-recap");
  const bridge = page.getByTestId("bridge-understood");
  const conv = page.getByTestId("conv-send"); // conv input is #conv-input (an id), not a testid
  const warmup = page.getByTestId("warmup-known");
  const vis = (l: typeof recap) => l.isVisible().catch(() => false);

  for (let block = 0; block < 3; block++) {
    // Wait for the next block (or the recap) to render before detecting it —
    // avoids a race during the SessionPlayer transition.
    await expect
      .poll(
        async () =>
          (await vis(recap)) ||
          (await vis(bridge)) ||
          (await vis(conv)) ||
          (await vis(warmup)),
      )
      .toBe(true);
    if (await vis(recap)) break;

    if (await vis(bridge)) await completeBridgeInSession(page);
    else if (await vis(conv)) await completeConversationInSession(page);
    else await completeWarmupInSession(page);
  }

  await expect(recap).toBeVisible();
  await expect(page.getByTestId("session-streak")).toHaveText("1");
  await page.screenshot({
    path: "e2e/__screenshots__/session-recap.png",
    fullPage: true,
  });
});
