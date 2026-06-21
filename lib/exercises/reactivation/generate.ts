import { z } from "zod";
import type { AIClient } from "@/lib/ai/AIClient";
import type { CefrLevel } from "@/lib/levels/cefr";

/**
 * Generate fresh cloze items so a Returner can keep practising past the seeded
 * set (new content on repeat sessions, even the same day). Deterministic under
 * MockAIClient via fixtureKey.
 */
const itemsSchema = z.object({
  items: z
    .array(
      z.object({
        prompt: z.string().min(1),
        target: z.string().min(1),
        topic: z.string().min(1),
      }),
    )
    .min(1),
});

export type GeneratedClozeItem = z.infer<typeof itemsSchema>["items"][number];

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("warmup: no JSON in response");
  return JSON.parse(text.slice(start, end + 1));
}

const SYSTEM = `Generate Spanish fill-the-blank (cloze) practice items for a lapsed learner (Returner).
Each item: a natural sentence with exactly one blank written as "___", the missing word as "target",
and a short "topic". Pitch them at the given CEFR level. Make them DIFFERENT from any "avoid" list.
Respond with ONLY JSON: {"items":[{"prompt":"...","target":"...","topic":"..."}, ...]}`;

export async function generateWarmupItems(
  ai: AIClient,
  input: { level: CefrLevel; count: number; avoid: string[] },
): Promise<GeneratedClozeItem[]> {
  const { text } = await ai.complete({
    system: SYSTEM,
    fixtureKey: "warmup:generate",
    messages: [
      {
        role: "user",
        content: `Level: ${input.level}\nHow many: ${input.count}\nAvoid these prompts:\n${input.avoid.join("\n")}`,
      },
    ],
    maxTokens: 600,
  });
  return itemsSchema.parse(extractJson(text)).items.slice(0, input.count);
}
