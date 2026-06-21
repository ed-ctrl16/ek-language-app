/**
 * Cloze answer matching. Deterministic — no AI needed for fill-the-blank, which
 * keeps the warm-up cheap, fast, and trivially testable.
 *
 * We normalise away the differences that aren't real mistakes (case, accents,
 * surrounding punctuation, extra whitespace) but we do NOT fuzzily accept a
 * different word — for reactivation, the exact conjugation/word is the point.
 * Missing accents are the one "typo" we forgive (learners routinely drop them).
 */
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
const PUNCTUATION = /[.,;:!?¿¡"'()]/g;

export function normalizeAnswer(s: string): string {
  return s
    .normalize("NFD")
    .replace(DIACRITICS, "") // á → a
    .toLowerCase()
    .replace(PUNCTUATION, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesCloze(expected: string, answer: string): boolean {
  const a = normalizeAnswer(answer);
  return a.length > 0 && a === normalizeAnswer(expected);
}

/**
 * Word-overlap ratio for whole-sentence repetition (the Bridge "Repeat it"
 * step). Order-insensitive and forgiving of a dropped word — repeating a model
 * sentence aloud doesn't need to be perfect to count as reactivation.
 */
export function sentenceMatchRatio(expected: string, answer: string): number {
  const expectedWords = normalizeAnswer(expected).split(" ").filter(Boolean);
  if (expectedWords.length === 0) return 0;
  const answerWords = new Set(normalizeAnswer(answer).split(" ").filter(Boolean));
  const hits = expectedWords.filter((w) => answerWords.has(w)).length;
  return hits / expectedWords.length;
}

export function matchesRepeat(
  expected: string,
  answer: string,
  threshold = 0.6,
): boolean {
  return sentenceMatchRatio(expected, answer) >= threshold;
}
