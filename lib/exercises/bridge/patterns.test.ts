import { describe, it, expect } from "vitest";
import { levelIndex } from "@/lib/levels/cefr";
import { bridgePatternsUpTo, patternForRotation } from "./patterns";

describe("bridge pattern rotation", () => {
  it("only offers patterns at or below the user's level", () => {
    for (const p of bridgePatternsUpTo("B1")) {
      expect(levelIndex(p.level)).toBeLessThanOrEqual(levelIndex("B1"));
    }
  });

  it("rotates to a different pattern as the index advances", () => {
    const a = patternForRotation("B2", 0).pattern;
    const b = patternForRotation("B2", 1).pattern;
    expect(a).not.toBe(b);
  });

  it("wraps around and handles negative indices", () => {
    const total = bridgePatternsUpTo("B2").length;
    expect(patternForRotation("B2", total).pattern).toBe(
      patternForRotation("B2", 0).pattern,
    );
    expect(typeof patternForRotation("B2", -1).pattern).toBe("string");
  });
});
