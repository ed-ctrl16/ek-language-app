import { z } from "zod";
import type { AIClient } from "@/lib/ai/AIClient";
import type {
  ConversationTurn,
  ConversationTurnResult,
  CorrectionIntensity,
} from "./types";

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("conversation: no JSON object in model response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

// ---- One conversational turn -----------------------------------------------

const turnSchema = z.object({
  reply: z.string().min(1),
  correction: z
    .object({
      original: z.string(),
      better: z.string(),
      note: z.string(),
    })
    .nullable(),
});

const INTENSITY_GUIDANCE: Record<CorrectionIntensity, string> = {
  minimal: "Only correct an error that blocks meaning. Usually return correction: null.",
  standard: "Correct at most ONE high-leverage error this turn, or null if it was fine.",
  detailed: "You may correct the single most useful error each turn (still one, not a list).",
};

function turnSystem(
  scenario: string,
  targetPattern: string,
  intensity: CorrectionIntensity,
): string {
  return `You are a warm Spanish conversation partner for a lapsed learner (Returner).
Stay fully in this scenario: ${scenario}
Target pattern to elicit: ${targetPattern}
Rules:
- Reply naturally in simple Spanish (1-2 sentences). Keep the scenario moving toward its goal.
- If the user lapses into English, answer in Spanish and gently invite them back — do not scold.
- Corrections are FORM-FOCUSED but never interrupt: put them in the "correction" field, not the reply.
- ${INTENSITY_GUIDANCE[intensity]} Never list multiple fixes (overcorrection guard).
Respond with ONLY JSON: {"reply":"...","correction":{"original":"...","better":"...","note":"..."}|null}`;
}

export async function converseTurn(
  ai: AIClient,
  input: {
    scenario: string;
    targetPattern: string;
    intensity: CorrectionIntensity;
    history: ConversationTurn[];
    userMessage: string;
  },
): Promise<ConversationTurnResult> {
  const transcript = input.history
    .map((t) => `${t.role === "user" ? "User" : "You"}: ${t.text}`)
    .join("\n");
  const { text } = await ai.complete({
    system: turnSystem(input.scenario, input.targetPattern, input.intensity),
    fixtureKey: "conversation:turn",
    messages: [
      {
        role: "user",
        content: `${transcript}\nUser: ${input.userMessage}`,
      },
    ],
    maxTokens: 400,
  });
  return turnSchema.parse(extractJson(text));
}

// ---- End-of-conversation summary -------------------------------------------

const summarySchema = z.object({
  win: z.boolean(),
  saidWell: z.string().min(1),
  patternToReview: z.string().min(1),
});

export type ConversationSummary = z.infer<typeof summarySchema>;

const SUMMARY_SYSTEM = `Summarise a short Spanish practice conversation for a Returner, encouragingly.
Return JSON:
- win: did they accomplish the scenario's goal? (lenient — attempting counts)
- saidWell: ONE specific thing they expressed well, quoted or paraphrased (build courage)
- patternToReview: ONE production pattern worth practising again tomorrow
Respond with ONLY: {"win":true|false,"saidWell":"...","patternToReview":"..."}`;

export async function summarizeConversation(
  ai: AIClient,
  input: { scenario: string; targetPattern: string; history: ConversationTurn[] },
): Promise<ConversationSummary> {
  const transcript = input.history
    .map((t) => `${t.role === "user" ? "User" : "Partner"}: ${t.text}`)
    .join("\n");
  const { text } = await ai.complete({
    system: SUMMARY_SYSTEM,
    fixtureKey: "conversation:summary",
    messages: [
      {
        role: "user",
        content: `Scenario: ${input.scenario}\nTarget: ${input.targetPattern}\n\n${transcript}`,
      },
    ],
    maxTokens: 300,
  });
  return summarySchema.parse(extractJson(text));
}
