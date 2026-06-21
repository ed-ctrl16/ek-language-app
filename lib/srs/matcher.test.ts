import { describe, it, expect } from "vitest";
import {
  matchesCloze,
  matchesRepeat,
  normalizeAnswer,
  sentenceMatchRatio,
} from "./matcher";

describe("normalizeAnswer", () => {
  it("strips case, accents, punctuation, and extra whitespace", () => {
    expect(normalizeAnswer("  ¿Está? ")).toBe("esta");
    expect(normalizeAnswer("FUI")).toBe("fui");
  });
});

describe("matchesCloze", () => {
  it("accepts an exact match", () => {
    expect(matchesCloze("fui", "fui")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(matchesCloze("fui", "Fui")).toBe(true);
  });

  it("forgives missing accents", () => {
    expect(matchesCloze("está", "esta")).toBe(true);
    expect(matchesCloze("viajaría", "viajaria")).toBe(true);
  });

  it("ignores surrounding punctuation and whitespace", () => {
    expect(matchesCloze("fui", "  fui. ")).toBe(true);
  });

  it("rejects a different word (wrong conjugation is wrong)", () => {
    expect(matchesCloze("fui", "vino")).toBe(false);
    expect(matchesCloze("viene", "vienen")).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(matchesCloze("fui", "")).toBe(false);
    expect(matchesCloze("fui", "   ")).toBe(false);
  });
});

describe("sentence repetition matching", () => {
  const sentence = "Cuando era niño vivía en Madrid";

  it("scores a perfect repeat as 1", () => {
    expect(sentenceMatchRatio(sentence, sentence)).toBe(1);
  });

  it("is order-insensitive and accent-forgiving", () => {
    expect(matchesRepeat(sentence, "Madrid en vivia niño era cuando")).toBe(true);
  });

  it("tolerates a dropped word", () => {
    expect(matchesRepeat(sentence, "cuando era niño en Madrid")).toBe(true);
  });

  it("fails when too little of the sentence is present", () => {
    expect(matchesRepeat(sentence, "Madrid")).toBe(false);
    expect(matchesRepeat(sentence, "")).toBe(false);
  });
});
