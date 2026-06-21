import { describe, it, expect } from "vitest";
import {
  computeGap,
  levelIndex,
  levelPercent,
  toBandLabel,
  CEFR_LEVELS,
} from "./cefr";

describe("cefr math", () => {
  it("indexes levels in order", () => {
    expect(levelIndex("A1")).toBe(0);
    expect(levelIndex("C2")).toBe(5);
  });

  it("maps levels to ascending percentages", () => {
    expect(levelPercent("A1")).toBeCloseTo(16.67, 1);
    expect(levelPercent("C2")).toBe(100);
    expect(levelPercent("B1")).toBeGreaterThan(levelPercent("A2"));
  });

  it("computes a positive gap when receptive leads productive", () => {
    const gap = computeGap("B2", "A2");
    expect(gap.steps).toBe(2);
    expect(gap.receptivePct).toBeGreaterThan(gap.productivePct);
  });

  it("clamps an inverted estimate to a zero gap", () => {
    const gap = computeGap("A2", "B2");
    expect(gap.steps).toBe(0);
    expect(gap.productivePct).toBe(gap.receptivePct);
  });

  it("reports a zero gap when levels match", () => {
    expect(computeGap("B1", "B1").steps).toBe(0);
  });
});

describe("toBandLabel (confidence framing)", () => {
  it("shows an exact level at high confidence", () => {
    expect(toBandLabel("B1", "high")).toBe("B1");
  });

  it("hedges at medium confidence", () => {
    expect(toBandLabel("B1", "medium")).toBe("around B1");
  });

  it("widens to a range at low confidence", () => {
    expect(toBandLabel("B1", "low")).toBe("A2–B2");
  });

  it("does not run past the scale edges at low confidence", () => {
    expect(toBandLabel("A1", "low")).toBe("A1–A2");
    expect(toBandLabel("C2", "low")).toBe("C1–C2");
  });

  it("covers every level without throwing", () => {
    for (const level of CEFR_LEVELS) {
      for (const c of ["low", "medium", "high"] as const) {
        expect(typeof toBandLabel(level, c)).toBe("string");
      }
    }
  });
});
