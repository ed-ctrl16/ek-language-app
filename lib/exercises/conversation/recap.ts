import type { Correction, CorrectionIntensity } from "./types";

/**
 * Conversation pacing + correction discipline (scope §4). Corrections never
 * interrupt the flow; they're collected and surfaced — capped — in the recap.
 * The cap is a retention guardrail: embarrassed learners churn under a feed of
 * mistakes, so we show the few most useful ones. Pure + unit-tested.
 */
export const MAX_TURNS = 6;

export function isConversationOver(
  userTurnCount: number,
  maxTurns: number = MAX_TURNS,
): boolean {
  return userTurnCount >= maxTurns;
}

/** How many corrections the after-session recap surfaces, by intensity. */
export function correctionCap(intensity: CorrectionIntensity): number {
  switch (intensity) {
    case "minimal":
      return 1;
    case "detailed":
      return 5;
    case "standard":
    default:
      return 3;
  }
}

/** Cap the collected corrections for the recap (keeps the earliest = highest-leverage). */
export function selectRecapCorrections(
  corrections: Correction[],
  intensity: CorrectionIntensity,
): Correction[] {
  return corrections.slice(0, correctionCap(intensity));
}
