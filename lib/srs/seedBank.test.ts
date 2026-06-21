import { describe, it, expect } from "vitest";
import { seedItemsForPeak } from "./seedBank";
import { isDue } from "./scheduler";

const NOW = new Date("2026-06-21T09:00:00.000Z");

describe("seedItemsForPeak", () => {
  it("seeds only at and below the peak level", () => {
    const items = seedItemsForPeak("A2", "u1", NOW);
    const levels = new Set(items.map((i) => i.level));
    expect(levels).toEqual(new Set(["A1", "A2"]));
  });

  it("seeds more items for a higher peak", () => {
    const a2 = seedItemsForPeak("A2", "u1", NOW).length;
    const b2 = seedItemsForPeak("B2", "u1", NOW).length;
    expect(b2).toBeGreaterThan(a2);
  });

  it("makes every seeded item due now", () => {
    const items = seedItemsForPeak("B1", "u1", NOW);
    expect(items.every((i) => isDue(i.production, NOW))).toBe(true);
  });

  it("produces unique ids and the right shape", () => {
    const items = seedItemsForPeak("B1", "u1", NOW);
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(items[0]).toMatchObject({
      userId: "u1",
      source: "seeded",
      isSavings: false,
    });
    expect(items[0]!.prompt).toContain("___");
  });
});
