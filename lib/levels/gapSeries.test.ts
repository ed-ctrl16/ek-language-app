import { describe, it, expect } from "vitest";
import { gapOverTime } from "./gapSeries";

describe("gapOverTime", () => {
  it("maps assessments to a shrinking gap series", () => {
    const series = gapOverTime([
      { createdAt: "2026-06-21", receptive: "B2", productive: "A2" }, // 2 steps
      { createdAt: "2026-06-28", receptive: "B2", productive: "B1" }, // 1 step
    ]);
    expect(series).toEqual([
      { date: "2026-06-21", steps: 2 },
      { date: "2026-06-28", steps: 1 },
    ]);
  });

  it("handles an empty history", () => {
    expect(gapOverTime([])).toEqual([]);
  });
});
