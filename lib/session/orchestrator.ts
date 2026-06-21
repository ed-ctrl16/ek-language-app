import type { Random } from "@/lib/random/Random";
import { interleave } from "@/lib/srs/interleaver";
import type { ExerciseSpec } from "./registry";

/** Target length of the daily session (scope: 15–20 minutes). */
export const DEFAULT_SESSION_BUDGET_MIN = 18;

export interface DailySessionPlan {
  blocks: ExerciseSpec[];
  estimatedMinutes: number;
}

/**
 * Plan the daily session: include exercises (in priority order) up to the time
 * budget, then interleave so no two of the same type sit adjacent. Pure — the
 * budget and Random are injected, so the plan is deterministic in tests.
 */
export function planDailySession(
  specs: ExerciseSpec[],
  budgetMinutes: number,
  random: Random,
): DailySessionPlan {
  const chosen: ExerciseSpec[] = [];
  let total = 0;
  for (const spec of specs) {
    if (total + spec.estimatedMinutes <= budgetMinutes) {
      chosen.push(spec);
      total += spec.estimatedMinutes;
    }
  }
  return {
    blocks: interleave(chosen, (s) => s.id, random),
    estimatedMinutes: total,
  };
}
