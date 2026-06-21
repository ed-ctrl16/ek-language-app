import type { Random } from "@/lib/random/Random";

/**
 * Reorder items so no two adjacent share a key, when possible (interleaving —
 * blocked practice is worse for retention than mixed practice). Greedy: always
 * place the key with the most remaining that isn't the one just placed. Pure;
 * Random breaks ties deterministically in tests.
 */
export function interleave<T>(
  items: T[],
  keyFn: (item: T) => string,
  random: Random,
): T[] {
  if (items.length <= 1) return [...items];

  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const k = keyFn(item);
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(item);
  }

  const result: T[] = [];
  let lastKey: string | null = null;

  while (result.length < items.length) {
    const candidates = [...buckets.entries()]
      .filter(([k, arr]) => arr.length > 0 && k !== lastKey)
      .sort((a, b) => b[1].length - a[1].length);

    // If the only items left share the last key, we have to place one anyway.
    const pool =
      candidates.length > 0
        ? candidates
        : [...buckets.entries()].filter(([, arr]) => arr.length > 0);

    const topCount = pool[0]![1].length;
    const tied = pool.filter(([, arr]) => arr.length === topCount);
    const [key, arr] = tied[random.int(0, tied.length)]!;
    result.push(arr.shift()!);
    lastKey = key;
  }

  return result;
}
