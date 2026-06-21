import { describe, it, expect } from "vitest";
import { MockAIClient } from "@/lib/ai/MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";
import { assessReturner } from "./assess";
import { computeGap } from "./cefr";

const INPUT = {
  background: {
    peakLevel: "B2" as const,
    yearsSinceActiveUse: 8,
    learningContext: "university",
    readsSpanish: false,
  },
  answers: [{ prompt: "Tell me about your weekend.", answer: "Fui al cine." }],
};

describe("assessReturner (AI seam)", () => {
  it("parses a structured dual-level estimate from the mock", async () => {
    const ai = new MockAIClient(AI_FIXTURES);
    const estimate = await assessReturner(ai, INPUT);
    expect(estimate.receptive).toBe("B2");
    expect(estimate.productive).toBe("A2");
    expect(estimate.confidence).toBe("medium");
    expect(estimate.gaps.length).toBeGreaterThan(0);
  });

  it("yields a positive receptive-expressive gap", async () => {
    const ai = new MockAIClient(AI_FIXTURES);
    const estimate = await assessReturner(ai, INPUT);
    expect(computeGap(estimate.receptive, estimate.productive).steps).toBeGreaterThan(0);
  });

  it("tolerates prose around the JSON", async () => {
    const ai = new MockAIClient({
      "assess:returner":
        'Here is the estimate: {"receptive":"B1","productive":"A2","confidence":"high","gaps":[]} — done.',
    });
    const estimate = await assessReturner(ai, INPUT);
    expect(estimate.receptive).toBe("B1");
  });

  it("rejects a malformed estimate loudly", async () => {
    const ai = new MockAIClient({
      "assess:returner": '{"receptive":"Z9","productive":"A2","confidence":"medium","gaps":[]}',
    });
    await expect(assessReturner(ai, INPUT)).rejects.toThrow();
  });
});
