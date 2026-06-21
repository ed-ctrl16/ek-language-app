import { z } from "zod";
import type { AIClient } from "@/lib/ai/AIClient";
import { cefrEnum } from "@/lib/levels/assess";
import type { CefrLevel } from "@/lib/levels/cefr";
import type { BridgeDrill, MakeAssessment } from "./types";

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("bridge: no JSON object in model response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

// ---- Generate a drill -------------------------------------------------------

const drillSchema = z.object({
  pattern: z.string().min(1),
  level: cefrEnum,
  hear: z.object({ sentence: z.string().min(1), translation: z.string().min(1) }),
  mod: z.object({
    cloze: z.string().min(1),
    target: z.string().min(1),
    distractor: z.string().min(1),
  }),
  make: z.object({ prompt: z.string().min(1), modelAnswer: z.string().min(1) }),
});

const GENERATE_SYSTEM = `You build a Spanish "Bridge Drill" that converts comprehension into production.
Given a target pattern and CEFR level, return ONE drill as JSON:
- hear: a short natural model sentence using the pattern, plus an English translation
- mod: the SAME sentence as a cloze (replace the pattern's key word with "___"), the missing word as "target", and a tempting-but-wrong alternative as "distractor"
- make: a prompt asking the learner to produce a NEW sentence using the same pattern, plus a model answer
Keep it at the given level. Respond with ONLY the JSON object:
{"pattern":"...","level":"A2|B1|B2|C1|C2|A1","hear":{"sentence":"...","translation":"..."},"mod":{"cloze":"...","target":"...","distractor":"..."},"make":{"prompt":"...","modelAnswer":"..."}}`;

export async function generateBridgeDrill(
  ai: AIClient,
  input: { pattern: string; level: CefrLevel },
): Promise<BridgeDrill> {
  const { text } = await ai.complete({
    system: GENERATE_SYSTEM,
    fixtureKey: "bridge:drill",
    messages: [
      { role: "user", content: `Pattern: ${input.pattern}\nLevel: ${input.level}` },
    ],
    maxTokens: 512,
  });
  return drillSchema.parse(extractJson(text));
}

// ---- Assess the Make step ---------------------------------------------------

const makeSchema = z.object({
  ok: z.boolean(),
  recast: z.string(),
  note: z.string(),
});

const ASSESS_SYSTEM = `You assess a lapsed learner's (Returner) attempt to produce a Spanish sentence using a target pattern.
Returner correction style is form-focused but encouraging. Rules:
- ok = true if the sentence uses the pattern and is comprehensible, even with minor errors.
- recast = the learner's sentence rewritten in natural, correct Spanish (one sentence).
- note = ONE short, specific tip about the single most useful fix (e.g. "imperfect for habitual past"). Never list multiple corrections (overcorrection guard). If it was already good, briefly affirm.
Respond with ONLY: {"ok":true|false,"recast":"...","note":"..."}`;

export async function assessMake(
  ai: AIClient,
  input: { pattern: string; prompt: string; userAnswer: string },
): Promise<MakeAssessment> {
  const { text } = await ai.complete({
    system: ASSESS_SYSTEM,
    fixtureKey: "bridge:make",
    messages: [
      {
        role: "user",
        content: `Pattern: ${input.pattern}\nPrompt: ${input.prompt}\nLearner said: ${input.userAnswer}`,
      },
    ],
    maxTokens: 256,
  });
  return makeSchema.parse(extractJson(text));
}
