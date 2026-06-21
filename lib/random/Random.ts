/**
 * Randomness seam. Nothing calls `Math.random()` directly — it takes a Random,
 * so interleaving / selection is reproducible under a seed in tests.
 */
export interface Random {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [minInclusive, maxExclusive). */
  int(minInclusive: number, maxExclusive: number): number;
  /** Pick one element from a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** Return a new shuffled copy (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[];
}

abstract class BaseRandom implements Random {
  abstract next(): number;

  int(minInclusive: number, maxExclusive: number): number {
    if (maxExclusive <= minInclusive) {
      throw new Error("Random.int: maxExclusive must be > minInclusive");
    }
    return minInclusive + Math.floor(this.next() * (maxExclusive - minInclusive));
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("Random.pick: empty array");
    return items[this.int(0, items.length)]!;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i + 1);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }
}

export class SystemRandom extends BaseRandom {
  next(): number {
    return Math.random();
  }
}

/** Deterministic PRNG (mulberry32). Same seed → same sequence. */
export class SeededRandom extends BaseRandom {
  private state: number;

  constructor(seed: number) {
    super();
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
