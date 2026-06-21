import { describe, it, expect } from "vitest";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { isDue } from "@/lib/srs/scheduler";
import { buildWarmupBlock } from "./warmup";

const NOW = new Date("2026-06-21T09:00:00.000Z");

describe("buildWarmupBlock", () => {
  it("caps the block at the requested size", () => {
    const items = seedItemsForPeak("B2", "u1", NOW); // more than 3
    expect(buildWarmupBlock(items, NOW, 3)).toHaveLength(3);
  });

  it("prefers items that are due now", () => {
    const items = seedItemsForPeak("B1", "u1", NOW);
    // Push one item far into the future so it isn't due.
    const future = new Date(NOW.getTime() + 30 * 86400000).toISOString();
    items[0]!.production = { intervalDays: 30, streak: 3, nextDue: future };

    const block = buildWarmupBlock(items, NOW, 10);
    expect(block.some((i) => i.id === items[0]!.id)).toBe(false);
    expect(block.every((i) => isDue(i.production, NOW))).toBe(true);
  });

  it("falls back to scheduled items when nothing is due (never empty)", () => {
    const items = seedItemsForPeak("A2", "u1", NOW).map((i) => ({
      ...i,
      production: {
        intervalDays: 7,
        streak: 1,
        nextDue: new Date(NOW.getTime() + 7 * 86400000).toISOString(),
      },
    }));
    const block = buildWarmupBlock(items, NOW, 5);
    expect(block.length).toBeGreaterThan(0);
  });
});
