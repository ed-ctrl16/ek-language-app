import { describe, it, expect } from "vitest";
import { SeededRandom } from "@/lib/random/Random";
import { EXERCISES } from "./registry";
import { planDailySession } from "./orchestrator";

describe("planDailySession", () => {
  it("includes all three exercises within a normal budget", () => {
    const plan = planDailySession(EXERCISES, 18, new SeededRandom(1));
    expect(plan.blocks).toHaveLength(3);
    expect(plan.estimatedMinutes).toBe(15);
  });

  it("respects the time budget", () => {
    const plan = planDailySession(EXERCISES, 10, new SeededRandom(1));
    expect(plan.estimatedMinutes).toBeLessThanOrEqual(10);
    expect(plan.blocks.length).toBeGreaterThan(0);
    expect(plan.blocks.length).toBeLessThan(3);
  });

  it("never places two of the same exercise type adjacent", () => {
    const plan = planDailySession(EXERCISES, 18, new SeededRandom(3));
    const ids = plan.blocks.map((b) => b.id);
    expect(ids.every((id, i) => i === 0 || id !== ids[i - 1])).toBe(true);
  });
});
