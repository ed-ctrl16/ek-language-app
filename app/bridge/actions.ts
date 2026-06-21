"use server";

import { z } from "zod";
import { getAIClient } from "@/lib/ai";
import { assessMake } from "@/lib/exercises/bridge/generate";
import type { MakeAssessment } from "@/lib/exercises/bridge/types";
import { getStore } from "@/lib/store";
import { getCurrentUserId } from "@/lib/session/currentUser";

const makeInput = z.object({
  pattern: z.string(),
  prompt: z.string(),
  userAnswer: z.string().min(1),
});

/** Assess the open "Make it" production via the AI seam. */
export async function assessMakeAction(
  raw: z.infer<typeof makeInput>,
): Promise<MakeAssessment> {
  const input = makeInput.parse(raw);
  const ai = await getAIClient();
  return assessMake(ai, input);
}

const attemptInput = z.object({
  promptShown: z.string(),
  expectedTarget: z.string(),
  userTranscript: z.string(),
  completed: z.boolean(),
  correction: z.string().nullable(),
  flaggedForReview: z.boolean(),
});

/** Record the Make-step production as a first-class attempt. */
export async function recordBridgeAttempt(
  raw: z.infer<typeof attemptInput>,
): Promise<{ ok: boolean }> {
  const input = attemptInput.parse(raw);
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  const store = await getStore();
  await store.saveAttempt({
    id: crypto.randomUUID(),
    userId,
    sessionId: null,
    practiceItemId: null,
    promptShown: input.promptShown,
    expectedTarget: input.expectedTarget,
    userTranscript: input.userTranscript,
    latencyMs: null,
    completed: input.completed,
    correction: input.correction,
    shouldReappear: input.flaggedForReview || !input.completed,
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}
