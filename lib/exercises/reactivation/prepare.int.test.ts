import { describe, it, expect } from "vitest";
import { MockAIClient } from "@/lib/ai/MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";
import { InMemoryStore } from "@/lib/store/InMemoryStore";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { prepareWarmupItems } from "./prepare";

const ai = new MockAIClient(AI_FIXTURES);
const NOW = new Date("2026-06-21T09:00:00.000Z");

describe("prepareWarmupItems", () => {
  it("serves due seeded items without generating when enough are due", async () => {
    const store = new InMemoryStore();
    await store.saveItems(seedItemsForPeak("B1", "u1", NOW)); // 8 items, all due

    const block = await prepareWarmupItems(store, ai, "u1", "B1", "B1", NOW);
    expect(block).toHaveLength(5);

    const items = await store.listItems("u1");
    expect(items.some((i) => i.source === "generated")).toBe(false);
  });

  it("tops up with freshly generated items when nothing is due (repeat session)", async () => {
    const store = new InMemoryStore();
    // All items scheduled into the future → none due today.
    const future = new Date(NOW.getTime() + 30 * 86400000).toISOString();
    await store.saveItems(
      seedItemsForPeak("A2", "u1", NOW).map((i) => ({
        ...i,
        production: { intervalDays: 30, streak: 3, nextDue: future },
      })),
    );

    const block = await prepareWarmupItems(store, ai, "u1", "A2", "A2", NOW);
    expect(block).toHaveLength(5);

    const items = await store.listItems("u1");
    expect(items.some((i) => i.source === "generated")).toBe(true);
  });

  it("seeds on first ever visit", async () => {
    const store = new InMemoryStore();
    const block = await prepareWarmupItems(store, ai, "new", "B1", "B1", NOW);
    expect(block.length).toBeGreaterThan(0);
    expect((await store.listItems("new")).length).toBeGreaterThan(0);
  });
});
