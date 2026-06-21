/**
 * The "stuck" protocol (scope §4): when a user freezes on a production step we
 * climb an escalating-help ladder rather than failing them. Each rung gives a
 * bit more support; the last rung flags the pattern for tomorrow and moves on.
 * Pure — content is derived from the known answer + an optional distractor.
 */
export const STUCK_LADDER = [
  "wait", // 0: "take your time"
  "first-word", // 1: reveal the opening
  "choices", // 2: two options, one correct
  "model", // 3: show the full answer to repeat
  "change-one-word", // 4: produce a near-variant
  "flag", // 5: mark for tomorrow, move on
] as const;

export type StuckRung = (typeof STUCK_LADDER)[number];

export function rungAt(level: number): StuckRung {
  const clamped = Math.max(0, Math.min(level, STUCK_LADDER.length - 1));
  return STUCK_LADDER[clamped]!;
}

/** Climb one rung, capped at the top ("flag"). */
export function escalate(level: number): number {
  return Math.min(level + 1, STUCK_LADDER.length - 1);
}

export function isMaxRung(level: number): boolean {
  return level >= STUCK_LADDER.length - 1;
}

/** First-word cue: the opening word, rest masked. */
export function firstWordCue(answer: string): string {
  const words = answer.trim().split(/\s+/);
  if (words.length <= 1) return `${answer.trim().charAt(0)}…`;
  return `${words[0]} …`;
}

/** Two choices (correct + distractor), ordered deterministically (alphabetical). */
export function twoChoices(answer: string, distractor: string): string[] {
  return [answer, distractor].sort((a, b) => a.localeCompare(b));
}
