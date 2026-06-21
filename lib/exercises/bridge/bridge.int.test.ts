import { describe, it, expect } from "vitest";
import { MockAIClient } from "@/lib/ai/MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";
import { matchesCloze, matchesRepeat } from "@/lib/srs/matcher";
import { generateBridgeDrill, assessMake } from "./generate";
import { nextStep } from "./steps";
import { escalate, isMaxRung, rungAt } from "./stuck";

const ai = new MockAIClient(AI_FIXTURES);

describe("bridge drill — full flow (mocked AI)", () => {
  it("generates a four-step drill and walks Hear → Repeat → Mod → Make", async () => {
    const drill = await generateBridgeDrill(ai, {
      pattern: "imperfect for habitual past",
      level: "B1",
    });

    // Hear it (comprehension confirmed) → Repeat it.
    let step: ReturnType<typeof nextStep> | "hear" = "hear";
    step = nextStep(step);
    expect(step).toBe("repeat");
    expect(matchesRepeat(drill.hear.sentence, drill.hear.sentence)).toBe(true);

    // Repeat → Mod, answered correctly.
    step = nextStep(step);
    expect(step).toBe("mod");
    expect(matchesCloze(drill.mod.target, "vivia")).toBe(true); // accent forgiven

    // Mod → Make, assessed by the AI seam.
    step = nextStep(step);
    expect(step).toBe("make");
    const verdict = await assessMake(ai, {
      pattern: drill.pattern,
      prompt: drill.make.prompt,
      userAnswer: "Cuando era niño vivia cerca del mar",
    });
    expect(verdict.ok).toBe(true);
    expect(verdict.recast.length).toBeGreaterThan(0);

    expect(nextStep(step)).toBe("done");
  });

  it("climbs the stuck ladder when the user freezes on Mod", () => {
    const drill = {
      mod: { target: "vivía", distractor: "viví" },
    };
    // A wrong answer triggers the stuck protocol.
    expect(matchesCloze(drill.mod.target, "viví")).toBe(false);

    let level = 0;
    const rungs = [rungAt(level)];
    while (!isMaxRung(level)) {
      level = escalate(level);
      rungs.push(rungAt(level));
    }
    expect(rungs).toEqual([
      "wait",
      "first-word",
      "choices",
      "model",
      "change-one-word",
      "flag",
    ]);
    // After the model rung is shown, the correct answer is reachable.
    expect(matchesCloze(drill.mod.target, drill.mod.target)).toBe(true);
  });
});
