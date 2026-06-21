import type { CefrLevel } from "@/lib/levels/cefr";

/**
 * A Bridge Drill — Habla's signature mechanic. The four-step ladder converts
 * passive comprehension into active production:
 *   Hear it → Repeat it → Mod it → Make it.
 * (A "Mix it" step between Mod and Make is a candidate if Make proves too big a
 * leap — see BUILD_PLAN Iteration 3; not built yet.)
 */
export interface BridgeDrill {
  /** The reusable pattern being drilled, in plain language. */
  pattern: string;
  level: CefrLevel;
  /** Hear it: a model sentence + its meaning. */
  hear: { sentence: string; translation: string };
  /** Mod it: same sentence as a cloze + the missing word + a tempting-but-wrong option. */
  mod: { cloze: string; target: string; distractor: string };
  /** Make it: an open prompt to produce a NEW sentence using the pattern. */
  make: { prompt: string; modelAnswer: string };
}

export type BridgeStep =
  | "hear"
  | "repeat"
  | "mod"
  | "mix"
  | "make"
  | "done";

export interface MakeAssessment {
  /** Did the user produce a usable sentence with the pattern? */
  ok: boolean;
  /** A single, gentle recast in correct Spanish (Returner: form-focused). */
  recast: string;
  /** One short note — never a feed of corrections (overcorrection guard). */
  note: string;
}
