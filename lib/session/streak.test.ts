import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("starts a streak when there's no prior activity", () => {
    expect(computeStreak(null, 0, "2026-06-21")).toEqual({ streak: 1, isNewDay: true });
  });

  it("does not double-count the same day", () => {
    expect(computeStreak("2026-06-21", 4, "2026-06-21")).toEqual({
      streak: 4,
      isNewDay: false,
    });
  });

  it("increments on a consecutive day", () => {
    expect(computeStreak("2026-06-21", 4, "2026-06-22")).toEqual({
      streak: 5,
      isNewDay: true,
    });
  });

  it("resets after a missed day", () => {
    expect(computeStreak("2026-06-21", 9, "2026-06-24")).toEqual({
      streak: 1,
      isNewDay: true,
    });
  });
});
