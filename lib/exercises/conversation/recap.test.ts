import { describe, it, expect } from "vitest";
import {
  MAX_TURNS,
  correctionCap,
  isConversationOver,
  selectRecapCorrections,
} from "./recap";
import type { Correction } from "./types";

const corr = (n: number): Correction => ({
  original: `o${n}`,
  better: `b${n}`,
  note: `note ${n}`,
});

describe("conversation pacing", () => {
  it("ends at the turn cap", () => {
    expect(isConversationOver(MAX_TURNS - 1)).toBe(false);
    expect(isConversationOver(MAX_TURNS)).toBe(true);
    expect(MAX_TURNS).toBeLessThanOrEqual(6);
  });
});

describe("correction caps by intensity", () => {
  it("caps minimal at 1, standard at 3, detailed at 5", () => {
    expect(correctionCap("minimal")).toBe(1);
    expect(correctionCap("standard")).toBe(3);
    expect(correctionCap("detailed")).toBe(5);
  });

  it("selects no more than the cap (keeps the earliest)", () => {
    const all = [1, 2, 3, 4, 5, 6].map(corr);
    expect(selectRecapCorrections(all, "minimal")).toEqual([corr(1)]);
    expect(selectRecapCorrections(all, "standard")).toHaveLength(3);
    expect(selectRecapCorrections(all, "detailed")).toHaveLength(5);
  });

  it("returns all when fewer than the cap", () => {
    expect(selectRecapCorrections([corr(1)], "standard")).toHaveLength(1);
    expect(selectRecapCorrections([], "detailed")).toEqual([]);
  });
});
