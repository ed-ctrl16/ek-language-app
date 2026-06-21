import { computeGap, type CefrLevel } from "./cefr";

/**
 * The receptive-expressive gap over time (the headline trend — down is the goal).
 * Pure: maps stored assessments to {date, steps}. Iteration 5 progress view.
 */
export interface GapPoint {
  date: string;
  steps: number;
}

export function gapOverTime(
  assessments: { createdAt: string; receptive: CefrLevel; productive: CefrLevel }[],
): GapPoint[] {
  return assessments.map((a) => ({
    date: a.createdAt,
    steps: computeGap(a.receptive, a.productive).steps,
  }));
}
