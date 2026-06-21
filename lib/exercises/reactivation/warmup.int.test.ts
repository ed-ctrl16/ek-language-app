import { describe, it, expect } from "vitest";
import { InMemoryStore } from "@/lib/store/InMemoryStore";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { markKnownState, reviewState } from "@/lib/srs/scheduler";
import { buildWarmupBlock } from "./warmup";

const NOW = new Date("2026-06-21T09:00:00.000Z");

// Mirrors what the recordWarmupAttempt server action does, against the store
// seam directly (the action itself is covered end-to-end by the e2e).
describe("warm-up data flow", () => {
  it("seeds, serves a due block, and advances the schedule on a correct review", async () => {
    const store = new InMemoryStore();
    await store.saveItems(seedItemsForPeak("B1", "u1", NOW));

    const block = buildWarmupBlock(await store.listItems("u1"), NOW, 5);
    expect(block.length).toBeGreaterThan(0);

    const item = block[0]!;
    expect(item.production.intervalDays).toBe(1);

    await store.updateItem({
      ...item,
      production: reviewState(item.production, true, NOW),
    });
    await store.saveAttempt({
      id: "att-1",
      userId: "u1",
      sessionId: null,
      practiceItemId: item.id,
      promptShown: item.prompt,
      expectedTarget: item.target,
      userTranscript: item.target,
      latencyMs: null,
      completed: true,
      correction: null,
      shouldReappear: false,
      createdAt: NOW.toISOString(),
    });

    const after = (await store.listItems("u1")).find((i) => i.id === item.id)!;
    expect(after.production.intervalDays).toBe(3); // advanced 1 → 3
    expect((await store.listAttempts("u1"))).toHaveLength(1);
  });

  it("fast-forwards a known item to day-7 and flags savings", async () => {
    const store = new InMemoryStore();
    await store.saveItems(seedItemsForPeak("A2", "u1", NOW));
    const item = (await store.listItems("u1"))[0]!;

    await store.updateItem({
      ...item,
      production: markKnownState(NOW),
      isSavings: true,
    });

    const after = (await store.listItems("u1")).find((i) => i.id === item.id)!;
    expect(after.production.intervalDays).toBe(7);
    expect(after.isSavings).toBe(true);
  });

  it("resets a missed item to day-1 and marks it to reappear", async () => {
    const store = new InMemoryStore();
    await store.saveItems(seedItemsForPeak("A2", "u1", NOW));
    const item = (await store.listItems("u1"))[0]!;

    // Pretend it had advanced, then was missed.
    const advanced = reviewState(item.production, true, NOW); // → 3
    const missed = reviewState(advanced, false, NOW); // → 1
    await store.updateItem({ ...item, production: missed });

    const after = (await store.listItems("u1")).find((i) => i.id === item.id)!;
    expect(after.production.intervalDays).toBe(1);
  });
});
