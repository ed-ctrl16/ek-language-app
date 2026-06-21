import { describe, it, expect } from "vitest";
import {
  STUCK_LADDER,
  escalate,
  firstWordCue,
  isMaxRung,
  rungAt,
  twoChoices,
} from "./stuck";

describe("stuck ladder", () => {
  it("climbs through each rung in order", () => {
    const seen: string[] = [];
    let level = 0;
    seen.push(rungAt(level));
    for (let i = 0; i < STUCK_LADDER.length + 2; i++) {
      level = escalate(level);
      seen.push(rungAt(level));
    }
    // climbs and then caps at "flag"
    expect(seen.slice(0, STUCK_LADDER.length)).toEqual([...STUCK_LADDER]);
    expect(seen.at(-1)).toBe("flag");
  });

  it("caps at the top rung", () => {
    expect(escalate(99)).toBe(STUCK_LADDER.length - 1);
    expect(isMaxRung(STUCK_LADDER.length - 1)).toBe(true);
    expect(isMaxRung(0)).toBe(false);
  });

  it("clamps out-of-range levels", () => {
    expect(rungAt(-5)).toBe("wait");
    expect(rungAt(999)).toBe("flag");
  });
});

describe("stuck hint content", () => {
  it("gives a first-word cue", () => {
    expect(firstWordCue("vivía en Madrid")).toBe("vivía …");
    expect(firstWordCue("fui")).toBe("f…");
  });

  it("offers two ordered choices", () => {
    expect(twoChoices("vivía", "viví")).toEqual(["viví", "vivía"]);
  });
});
