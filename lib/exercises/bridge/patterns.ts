import { CEFR_LEVELS, levelIndex, type CefrLevel } from "@/lib/levels/cefr";

/**
 * Bridge-able patterns by level — seed targets for the generator. A Returner
 * gets a pattern at (or below) their productive level; we rotate through them
 * so consecutive sessions don't repeat. Replaced by patterns surfaced from real
 * conversation later.
 */
const PATTERNS: Record<CefrLevel, string[]> = {
  A1: ["introducing yourself with 'me llamo'", "saying where you're from ('soy de...')"],
  A2: [
    "talking about a finished past action with the preterite (fui, comí)",
    "describing daily routine in the present (me levanto, trabajo)",
  ],
  B1: [
    "describing habitual past actions with the imperfect (vivía, iba)",
    "expressing wishes with 'espero que' + subjunctive",
    "making plans with 'voy a' + infinitive",
  ],
  B2: [
    "hypotheticals with 'si tuviera ... + conditional'",
    "expressing doubt with 'no creo que' + subjunctive",
    "giving opinions with reasons ('lo mejor es que...')",
  ],
  C1: ["regret with the pluperfect subjunctive (hubiera + participle)"],
  C2: ["nuanced concession with 'por más que' + subjunctive"],
};

export interface BridgePattern {
  pattern: string;
  level: CefrLevel;
}

/** All patterns at or below the user's level (lowest first). */
export function bridgePatternsUpTo(level: CefrLevel): BridgePattern[] {
  const out: BridgePattern[] = [];
  for (const lvl of CEFR_LEVELS) {
    if (levelIndex(lvl) > levelIndex(level)) continue;
    for (const pattern of PATTERNS[lvl]) out.push({ pattern, level: lvl });
  }
  return out;
}

/** Pick the first eligible pattern (deterministic — used where rotation isn't needed). */
export function patternForLevel(level: CefrLevel): BridgePattern {
  const all = bridgePatternsUpTo(level);
  return all.at(-1) ?? { pattern: PATTERNS.A2[0]!, level: "A2" };
}

/** Rotate through eligible patterns by index `n` (e.g. sessions completed). */
export function patternForRotation(level: CefrLevel, n: number): BridgePattern {
  const all = bridgePatternsUpTo(level);
  if (all.length === 0) return { pattern: PATTERNS.A2[0]!, level: "A2" };
  const i = ((n % all.length) + all.length) % all.length;
  return all[i]!;
}
