"use server";

import { z } from "zod";
import { getStore } from "@/lib/store";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { computeStreak } from "@/lib/session/streak";

const input = z.object({ blocks: z.array(z.string()) });

/**
 * Finish the daily session: record the session row and roll the day-streak.
 * Streak counts DAYS, not minutes (activation threshold over volume).
 */
export async function completeSessionAction(
  raw: z.infer<typeof input>,
): Promise<{ streak: number }> {
  const { blocks } = input.parse(raw);
  const userId = await getCurrentUserId();
  if (!userId) return { streak: 0 };

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) return { streak: 0 };

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const { streak } = computeStreak(user.lastActiveDate, user.streakCount, today);

  await store.saveUser({ ...user, streakCount: streak, lastActiveDate: today });
  await store.saveSession({
    id: crypto.randomUUID(),
    userId,
    exerciseBlocks: blocks,
    durationSeconds: null,
    completed: true,
    createdAt: now.toISOString(),
  });

  return { streak };
}
