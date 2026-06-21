import { test, expect } from "@playwright/test";
import { onboardReturner } from "./helpers";

// Onboarding → dashboard journey (text path). Confirms the stored dual-level
// gap renders with hedged, no-false-precision band labels.
test("onboard a Returner and see the gap", async ({ page }) => {
  await onboardReturner(page);

  await expect(page.getByText("You can say", { exact: true })).toBeVisible();
  await expect(page.getByText("around B2")).toBeVisible();
  await expect(page.getByText("around A2")).toBeVisible();

  await page.screenshot({
    path: "e2e/__screenshots__/dashboard.png",
    fullPage: true,
  });
});
