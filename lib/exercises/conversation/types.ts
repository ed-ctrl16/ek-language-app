import type { CefrLevel } from "@/lib/levels/cefr";

export type CorrectionIntensity = "minimal" | "standard" | "detailed";

/** A short, real-life speaking scenario with a target pattern and a clear win. */
export interface ConversationMission {
  id: string;
  /** English description of the situation (what the user is trying to do). */
  scenario: string;
  /** Claude's opening line in Spanish (deterministic — no AI call to start). */
  opener: string;
  /** The production pattern this mission practises. */
  targetPattern: string;
  level: CefrLevel;
  maxTurns: number;
}

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

/** Form-focused correction (Returner style): what they said → a better version + one note. */
export interface Correction {
  original: string;
  better: string;
  note: string;
}

export interface ConversationTurnResult {
  reply: string;
  correction: Correction | null;
}

export interface ConversationRecap {
  win: boolean;
  /** One specific thing the user said well (courage-building). */
  saidWell: string;
  /** Capped, after-session coaching corrections (by intensity). */
  corrections: Correction[];
  /** One pattern flagged to revisit tomorrow. */
  patternToReview: string;
}
