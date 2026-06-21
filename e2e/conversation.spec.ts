import { test, expect } from "@playwright/test";
import { onboardReturner } from "./helpers";

// Guided conversation journey (text path): a couple of turns with a live
// correction surfaced quietly, then the recap with the "said well" highlight.
test("run a conversation mission and see the recap", async ({ page }) => {
  await onboardReturner(page);

  await page.getByTestId("conversation-link").click();
  await expect(
    page.getByRole("heading", { name: "Conversation Mission" }),
  ).toBeVisible();
  // Claude's opener is present.
  await expect(page.getByTestId("conv-messages")).toContainText(/\?/);

  // Turn 1.
  await page.fill("#conv-input", "voy llegar tarde");
  await page.getByTestId("conv-send").click();
  // A live correction appears in the Notes panel (non-interrupting).
  await expect(page.getByTestId("conv-corrections")).toContainText(
    "voy a llegar tarde",
  );

  // Turn 2.
  await page.fill("#conv-input", "lo siento, llego en veinte minutos");
  await page.getByTestId("conv-send").click();
  await page.screenshot({
    path: "e2e/__screenshots__/conversation.png",
    fullPage: true,
  });

  // End and see the recap.
  await page.getByTestId("conv-finish").click();
  await expect(page.getByTestId("conv-saidwell")).toBeVisible();
  await expect(page.getByTestId("conv-recap")).toBeVisible();
  await page.screenshot({
    path: "e2e/__screenshots__/conversation-recap.png",
    fullPage: true,
  });
});
