"use server";

import { z } from "zod";
import { getStore } from "@/lib/store";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { markKnownState, reviewState } from "@/lib/srs/scheduler";

const inputSchema = z.object({
  itemId: z.string(),
  answer: z.string(),
  correct: z.boolean(),
  known: z.boolean(),
});

export type WarmupAttemptInput = z.infer<typeof inputSchema>;

/**
 * Persist one warm-up attempt: advance (or fast-forward) the item's production
 * schedule and record a first-class attempt. Matching already happened on the
 * client (deterministic); this is the durable write.
 */
export async function recordWarmupAttempt(
  raw: WarmupAttemptInput,
): Promise<{ ok: boolean }> {
  const input = inputSchema.parse(raw);
  const userId = getCurrentUserId();
  if (!userId) return { ok: false };

  const store = await getStore();
  const items = await store.listItems(userId);
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return { ok: false };

  const now = new Date(); // edge: real time is fine here
  const succeeded = input.known || input.correct;

  await store.updateItem({
    ...item,
    production: input.known
      ? markKnownState(now)
      : reviewState(item.production, input.correct, now),
    isSavings: input.known || item.isSavings,
  });

  await store.saveAttempt({
    id: crypto.randomUUID(),
    userId,
    sessionId: null,
    practiceItemId: item.id,
    promptShown: item.prompt,
    expectedTarget: item.target,
    userTranscript: input.answer,
    latencyMs: null,
    completed: succeeded,
    correction: succeeded ? null : `Try: ${item.target}`,
    shouldReappear: !succeeded,
    createdAt: now.toISOString(),
  });

  return { ok: true };
}
