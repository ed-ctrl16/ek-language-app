import { describe, it, expect } from "vitest";
import { SeededRandom } from "./Random";

describe("SeededRandom", () => {
  it("produces the same sequence for the same seed", () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = new SeededRandom(1);
    const b = new SeededRandom(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("next() stays in [0, 1)", () => {
    const r = new SeededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const n = r.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("int() stays within [min, max)", () => {
    const r = new SeededRandom(99);
    for (let i = 0; i < 1000; i++) {
      const n = r.int(3, 8);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThan(8);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it("int() throws on an empty range", () => {
    const r = new SeededRandom(1);
    expect(() => r.int(5, 5)).toThrow();
  });

  it("shuffle() is a deterministic permutation", () => {
    const items = [1, 2, 3, 4, 5];
    const a = new SeededRandom(3).shuffle(items);
    const b = new SeededRandom(3).shuffle(items);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]); // original untouched
  });

  it("pick() throws on an empty array", () => {
    const r = new SeededRandom(1);
    expect(() => r.pick([])).toThrow();
  });
});
