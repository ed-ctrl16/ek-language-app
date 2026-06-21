import type { Random } from "@/lib/random/Random";
import { normalizeAnswer } from "@/lib/srs/matcher";

/**
 * "Mix it" — the scaffold between Mod and Make. The learner arranges given word
 * chunks into the model sentence before producing one from scratch, softening
 * the leap to open production. Derived deterministically from the model sentence
 * (a Random is injected so the scramble is reproducible in tests).
 */
export interface MixStep {
  chunks: string[];
  answer: string;
}

export function buildMix(sentence: string, random: Random): MixStep {
  const answer = sentence.trim();
  const words = answer.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { chunks: words, answer };

  let chunks = random.shuffle(words);
  // Make sure the scramble isn't accidentally already in order.
  if (chunks.join(" ") === words.join(" ")) chunks = [...words].reverse();
  return { chunks, answer };
}

export function isMixCorrect(assembled: string[], answer: string): boolean {
  return (
    assembled.length > 0 &&
    normalizeAnswer(assembled.join(" ")) === normalizeAnswer(answer)
  );
}

/** Deterministic seed from a string so a given sentence always scrambles the same way. */
export function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}
