import { describe, it, expect } from "vitest";
import { SeededRandom } from "@/lib/random/Random";
import { interleave } from "./interleaver";

function noTwoAdjacentSame(keys: string[]): boolean {
  return keys.every((k, i) => i === 0 || k !== keys[i - 1]);
}

describe("interleave", () => {
  it("keeps all items (a permutation)", () => {
    const items = ["a", "a", "b", "c"];
    const out = interleave(items, (x) => x, new SeededRandom(1));
    expect([...out].sort()).toEqual([...items].sort());
  });

  it("avoids adjacent duplicates when possible", () => {
    const items = ["a", "a", "b", "c"];
    const out = interleave(items, (x) => x, new SeededRandom(1));
    expect(noTwoAdjacentSame(out)).toBe(true);
  });

  it("is deterministic under a fixed seed", () => {
    const items = ["a", "b", "a", "c", "b"];
    const a = interleave(items, (x) => x, new SeededRandom(5));
    const b = interleave(items, (x) => x, new SeededRandom(5));
    expect(a).toEqual(b);
  });

  it("handles distinct items trivially", () => {
    const out = interleave(["x", "y", "z"], (s) => s, new SeededRandom(2));
    expect(noTwoAdjacentSame(out)).toBe(true);
    expect(out).toHaveLength(3);
  });
});
