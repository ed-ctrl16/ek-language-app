import { describe, it, expect } from "vitest";
import { matchesCloze, normalizeAnswer } from "./matcher";

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
