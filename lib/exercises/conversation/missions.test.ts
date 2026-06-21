import { describe, it, expect } from "vitest";
import { levelIndex } from "@/lib/levels/cefr";
import { MAX_TURNS } from "./recap";
import { pickMission } from "./missions";

describe("pickMission", () => {
  it("never returns a mission above the user's level", () => {
    const m = pickMission("A2");
    expect(levelIndex(m.level)).toBeLessThanOrEqual(levelIndex("A2"));
  });

  it("scales up the mission level with the user", () => {
    expect(levelIndex(pickMission("B2").level)).toBeGreaterThanOrEqual(
      levelIndex(pickMission("A2").level),
    );
  });

  it("carries a scenario, opener, target pattern, and the turn cap", () => {
    const m = pickMission("B1");
    expect(m.scenario.length).toBeGreaterThan(0);
    expect(m.opener.length).toBeGreaterThan(0);
    expect(m.targetPattern.length).toBeGreaterThan(0);
    expect(m.maxTurns).toBe(MAX_TURNS);
  });
});
