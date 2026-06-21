/**
 * CEFR levels and the receptive-expressive gap — the product's north-star math.
 * Pure, no I/O. Confidence framing avoids false precision (scope §2).
 */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export type Confidence = "low" | "medium" | "high";

export function levelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/** Position of a level on a 0–100 scale for the gap bar. */
export function levelPercent(level: CefrLevel): number {
  return ((levelIndex(level) + 1) / CEFR_LEVELS.length) * 100;
}

export interface Gap {
  /** Whole CEFR steps between understanding and speaking (>= 0). */
  steps: number;
  productivePct: number;
  receptivePct: number;
}

/**
 * The gap. Productive is expected at or below receptive for our personas; if an
 * estimate inverts (noise), we clamp so the bar never shows a negative gap.
 */
export function computeGap(receptive: CefrLevel, productive: CefrLevel): Gap {
  const r = levelIndex(receptive);
  const p = Math.min(levelIndex(productive), r);
  const clampedProductive = CEFR_LEVELS[p]!;
  return {
    steps: r - p,
    productivePct: levelPercent(clampedProductive),
    receptivePct: levelPercent(receptive),
  };
}

/**
 * Human band label that widens with uncertainty rather than asserting a precise
 * level: high confidence → exact ("B1"); medium → "around B1"; low → a range
 * ("A2–B1"). One level only at the scale edges.
 */
export function toBandLabel(level: CefrLevel, confidence: Confidence): string {
  if (confidence === "high") return level;
  if (confidence === "medium") return `around ${level}`;

  const i = levelIndex(level);
  const lower = CEFR_LEVELS[Math.max(0, i - 1)]!;
  const upper = CEFR_LEVELS[Math.min(CEFR_LEVELS.length - 1, i + 1)]!;
  if (lower === upper) return level;
  return `${lower}–${upper}`;
}
