import { describe, it, expect } from "vitest";
import { SeededRandom } from "@/lib/random/Random";
import { buildMix, isMixCorrect, seedFromString } from "./mix";

describe("buildMix", () => {
  const sentence = "Cuando era niño vivía en Bristol";

  it("returns the words as a permutation of the model", () => {
    const { chunks, answer } = buildMix(sentence, new SeededRandom(7));
    expect(answer).toBe(sentence);
    expect([...chunks].sort()).toEqual(sentence.split(" ").sort());
  });

  it("is deterministic for the same seed", () => {
    const a = buildMix(sentence, new SeededRandom(7)).chunks;
    const b = buildMix(sentence, new SeededRandom(7)).chunks;
    expect(a).toEqual(b);
  });

  it("does not leave the scramble already in order", () => {
    // Try several seeds; none should equal the original order.
    for (let s = 0; s < 20; s++) {
      const { chunks } = buildMix(sentence, new SeededRandom(s));
      expect(chunks.join(" ")).not.toBe(sentence);
    }
  });
});

describe("isMixCorrect", () => {
  it("accepts the right order (accent/punct tolerant)", () => {
    expect(isMixCorrect(["Cuando", "era", "niño"], "cuando era nino")).toBe(true);
  });

  it("rejects the wrong order and empty input", () => {
    expect(isMixCorrect(["era", "Cuando", "niño"], "Cuando era niño")).toBe(false);
    expect(isMixCorrect([], "Cuando")).toBe(false);
  });
});

describe("seedFromString", () => {
  it("is stable and non-negative", () => {
    expect(seedFromString("hola")).toBe(seedFromString("hola"));
    expect(seedFromString("hola")).toBeGreaterThanOrEqual(0);
  });
});
