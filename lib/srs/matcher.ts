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
