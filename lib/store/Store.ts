import type { CefrLevel, Confidence } from "@/lib/levels/cefr";

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

export interface Store {
  getUser(id: string): Promise<HablaUser | null>;
  saveUser(user: HablaUser): Promise<void>;
  saveAssessment(assessment: Assessment): Promise<void>;
  listAssessments(userId: string): Promise<Assessment[]>;
}
