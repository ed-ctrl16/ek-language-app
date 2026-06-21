import { CEFR_LEVELS, levelIndex, type CefrLevel } from "@/lib/levels/cefr";

/**
 * Bridge-able patterns by level — the seed targets the generator drills. A
 * Returner gets a pattern at (or just below) their productive level. Replaced
 * by patterns surfaced from real conversation in a later iteration.
 */
const PATTERNS: Record<CefrLevel, string[]> = {
  A1: ["introducing yourself with 'me llamo'"],
  A2: ["talking about a finished past action with the preterite (fui, comí)"],
  B1: [
    "describing habitual past actions with the imperfect (vivía, iba)",
    "expressing wishes with 'espero que' + subjunctive",
  ],
  B2: [
    "hypotheticals with 'si tuviera ... + conditional'",
    "expressing doubt with 'no creo que' + subjunctive",
  ],
  C1: ["regret with the pluperfect subjunctive (hubiera + participle)"],
  C2: ["nuanced concession with 'por más que' + subjunctive"],
};

/** Pick a pattern at or just below the user's productive level. */
export function patternForLevel(level: CefrLevel): { pattern: string; level: CefrLevel } {
  const target = levelIndex(level);
  for (let i = target; i >= 0; i--) {
    const lvl = CEFR_LEVELS[i]!;
    const pool = PATTERNS[lvl];
    if (pool.length > 0) return { pattern: pool[0]!, level: lvl };
  }
  return { pattern: PATTERNS.A2[0]!, level: "A2" };
}
