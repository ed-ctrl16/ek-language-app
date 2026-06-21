"use server";

import { z } from "zod";
import { getAIClient } from "@/lib/ai";
import { getStore } from "@/lib/store";
import { getCurrentUserId } from "@/lib/session/currentUser";
import {
  converseTurn,
  summarizeConversation,
} from "@/lib/exercises/conversation/converse";
import { selectRecapCorrections } from "@/lib/exercises/conversation/recap";
import type {
  ConversationRecap,
  ConversationTurnResult,
} from "@/lib/exercises/conversation/types";
import { freshState } from "@/lib/srs/scheduler";

const turnInput = z.object({
  scenario: z.string(),
  targetPattern: z.string(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })),
  userMessage: z.string().min(1),
});

/** One conversational turn (reply + optional non-interrupting correction). */
export async function converseTurnAction(
  raw: z.infer<typeof turnInput>,
): Promise<ConversationTurnResult> {
  const input = turnInput.parse(raw);
  const userId = await getCurrentUserId();
  const store = await getStore();
  const user = userId ? await store.getUser(userId) : null;
  const intensity = user?.correctionIntensity ?? "standard";

  const ai = await getAIClient();
  return converseTurn(ai, { ...input, intensity });
}

const finishInput = z.object({
  scenario: z.string(),
  targetPattern: z.string(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })),
  corrections: z.array(
    z.object({ original: z.string(), better: z.string(), note: z.string() }),
  ),
});

/**
 * End the mission: summarise, cap corrections by the user's intensity, record
 * the user turns as attempts, and queue the flagged pattern for tomorrow.
 */
export async function finishConversationAction(
  raw: z.infer<typeof finishInput>,
): Promise<ConversationRecap> {
  const input = finishInput.parse(raw);
  const userId = await getCurrentUserId();
  const store = await getStore();
  const user = userId ? await store.getUser(userId) : null;
  const intensity = user?.correctionIntensity ?? "standard";

  const ai = await getAIClient();
  const summary = await summarizeConversation(ai, {
    scenario: input.scenario,
    targetPattern: input.targetPattern,
    history: input.history,
  });

  if (userId) {
    const now = new Date();
    // Record each user turn as a first-class attempt.
    for (const turn of input.history.filter((t) => t.role === "user")) {
      await store.saveAttempt({
        id: crypto.randomUUID(),
        userId,
        sessionId: null,
        practiceItemId: null,
        promptShown: input.scenario,
        expectedTarget: input.targetPattern,
        userTranscript: turn.text,
        latencyMs: null,
        completed: summary.win,
        correction: null,
        shouldReappear: false,
        createdAt: now.toISOString(),
      });
    }
    // Queue the flagged pattern for tomorrow.
    const due = freshState(now, false); // not due now → tomorrow per interval
    await store.saveItems([
      {
        id: crypto.randomUUID(),
        userId,
        itemType: "pattern",
        prompt: `Use this again: ${summary.patternToReview}`,
        target: summary.patternToReview,
        topic: "conversation",
        level: user?.productiveLevel ?? "A2",
        recognition: due,
        production: due,
        source: "from_conversation",
        isSavings: false,
        createdAt: now.toISOString(),
      },
    ]);
  }

  return {
    win: summary.win,
    saidWell: summary.saidWell,
    corrections: selectRecapCorrections(input.corrections, intensity),
    patternToReview: summary.patternToReview,
  };
}
