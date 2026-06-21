import { describe, it, expect } from "vitest";
import { levelIndex } from "@/lib/levels/cefr";
import { MAX_TURNS } from "./recap";
import { missionForRotation, pickMission } from "./missions";

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

  it("rotates to a different mission as the index advances", () => {
    const a = missionForRotation("B2", 0).id;
    const b = missionForRotation("B2", 1).id;
    expect(a).not.toBe(b);
  });

  it("wraps mission rotation and never exceeds the level", () => {
    expect(levelIndex(missionForRotation("A2", 3).level)).toBeLessThanOrEqual(
      levelIndex("A2"),
    );
  });
});
