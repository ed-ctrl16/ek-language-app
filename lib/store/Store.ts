import type { CefrLevel, Confidence } from "@/lib/levels/cefr";
import type { PracticeItem } from "@/lib/srs/types";

export type { PracticeItem } from "@/lib/srs/types";

/**
 * Persistence seam. The app talks to this interface, never to Supabase
 * directly, so flows are testable against an in-memory double and the app
 * runs locally without a configured backend.
 */
export interface HablaUser {
  id: string;
  pathway: "returner";
  receptiveLevel: CefrLevel;
  productiveLevel: CefrLevel;
  confidence: Confidence;
  peakLevel: CefrLevel;
  yearsSinceActiveUse: number;
  readsSpanish: boolean;
  goals: string[];
  topics: string[];
  correctionIntensity: "minimal" | "standard" | "detailed";
  streakCount: number;
  createdAt: string;
}

export interface Assessment {
  id: string;
  userId: string;
  receptive: CefrLevel;
  productive: CefrLevel;
  confidence: Confidence;
  gaps: string[];
  createdAt: string;
}

/** First-class record of one user production attempt (scope §7). */
export interface Attempt {
  id: string;
  userId: string;
  sessionId: string | null;
  practiceItemId: string | null;
  promptShown: string;
  expectedTarget: string;
  userTranscript: string;
  latencyMs: number | null;
  completed: boolean;
  correction: string | null;
  shouldReappear: boolean;
  createdAt: string;
}

export interface Store {
  getUser(id: string): Promise<HablaUser | null>;
  saveUser(user: HablaUser): Promise<void>;
  saveAssessment(assessment: Assessment): Promise<void>;
  listAssessments(userId: string): Promise<Assessment[]>;

  // Practice items (SRS bank)
  listItems(userId: string): Promise<PracticeItem[]>;
  saveItems(items: PracticeItem[]): Promise<void>;
  updateItem(item: PracticeItem): Promise<void>;

  // Attempts
  saveAttempt(attempt: Attempt): Promise<void>;
  listAttempts(userId: string): Promise<Attempt[]>;
}
