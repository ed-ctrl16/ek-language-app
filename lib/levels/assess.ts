import { z } from "zod";
import type { AIClient } from "@/lib/ai/AIClient";
import type { CefrLevel, Confidence } from "./cefr";

/** Zod CEFR enum (literal tuple → preserves the CefrLevel union on parse). */
export const cefrEnum = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

/** Returner background captured in onboarding. */
export interface ReturnerBackground {
  peakLevel: CefrLevel;
  yearsSinceActiveUse: number;
  learningContext: string; // university | school | immersion | app
  readsSpanish: boolean;
}

/** A single diagnostic answer (cloze or short conversation turn). */
export interface DiagnosticAnswer {
  prompt: string;
  answer: string;
}

export interface AssessmentInput {
  background: ReturnerBackground;
  answers: DiagnosticAnswer[];
}

export interface LevelEstimate {
  receptive: CefrLevel;
  productive: CefrLevel;
  confidence: Confidence;
  gaps: string[];
}

const FIXTURE_KEY = "assess:returner";

const estimateSchema = z.object({
  receptive: cefrEnum,
  productive: cefrEnum,
  confidence: z.enum(["low", "medium", "high"]),
  gaps: z.array(z.string()).max(5),
});

const SYSTEM = `You are a calibrated Spanish assessor for lapsed learners (Returners).
Estimate the user's receptive (understanding) and productive (speaking) CEFR levels
SEPARATELY from their background and short diagnostic answers. Returners almost always
understand more than they can produce. Be conservative; prefer a band you are sure of.
Respond with ONLY a JSON object, no prose, matching:
{"receptive":"A1|A2|B1|B2|C1|C2","productive":"A1|A2|B1|B2|C1|C2","confidence":"low|medium|high","gaps":["short phrase", ...]}`;

export function buildAssessmentPrompt(input: AssessmentInput): string {
  const { background, answers } = input;
  const answerLines = answers
    .map((a, i) => `${i + 1}. Prompt: ${a.prompt}\n   Answer: ${a.answer}`)
    .join("\n");
  return [
    `Peak level reached: ${background.peakLevel}`,
    `Years since active use: ${background.yearsSinceActiveUse}`,
    `Original learning context: ${background.learningContext}`,
    `Still reads Spanish: ${background.readsSpanish ? "yes" : "no"}`,
    ``,
    `Diagnostic answers:`,
    answerLines,
  ].join("\n");
}

/** Extract the first JSON object from a model response (tolerates stray prose). */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("assessReturner: no JSON object in model response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Estimate the Returner's dual levels via the AI seam. Deterministic under
 * MockAIClient (matched by fixtureKey). Validates the response shape so a
 * malformed estimate fails loudly rather than corrupting the gap.
 */
export async function assessReturner(
  ai: AIClient,
  input: AssessmentInput,
): Promise<LevelEstimate> {
  const { text } = await ai.complete({
    system: SYSTEM,
    fixtureKey: FIXTURE_KEY,
    messages: [{ role: "user", content: buildAssessmentPrompt(input) }],
    maxTokens: 512,
  });
  return estimateSchema.parse(extractJson(text));
}
