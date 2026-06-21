"use server";

import { z } from "zod";
import { getAIClient } from "@/lib/ai";
import { assessReturner, cefrEnum } from "@/lib/levels/assess";
import { getStore } from "@/lib/store";
import { setCurrentUserId } from "@/lib/session/currentUser";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import { isTestMode } from "@/lib/testkit/testMode";

// Validate at the boundary — onboarding input crosses from client to server.
const payloadSchema = z.object({
  background: z.object({
    peakLevel: cefrEnum,
    yearsSinceActiveUse: z.number().int().min(0).max(80),
    learningContext: z.string().min(1),
    readsSpanish: z.boolean(),
  }),
  answers: z
    .array(z.object({ prompt: z.string(), answer: z.string() }))
    .min(1)
    .max(10),
  goals: z.array(z.string()).max(6),
  topics: z.array(z.string()).max(10),
});

export type OnboardingPayload = z.infer<typeof payloadSchema>;

/** First-win micro-conversation reply (warm Spanish, gentle). */
export async function getFirstWinReply(userText: string): Promise<string> {
  const ai = await getAIClient();
  const { text } = await ai.complete({
    system:
      "You are a warm, encouraging Spanish coach for someone reactivating rusty Spanish. " +
      "Reply in simple Spanish (1–2 sentences), affirm what they said, never correct harshly.",
    fixtureKey: "firstwin:reply",
    messages: [{ role: "user", content: userText }],
    maxTokens: 256,
  });
  return text;
}

/**
 * Finish onboarding: estimate dual levels via the AI seam, persist the user +
 * assessment, set the single-user cookie. Returns ok; the client redirects.
 */
export async function completeOnboarding(
  raw: OnboardingPayload,
): Promise<{ ok: true }> {
  const payload = payloadSchema.parse(raw);
  const ai = await getAIClient();
  const estimate = await assessReturner(ai, {
    background: payload.background,
    answers: payload.answers,
  });

  const store = await getStore();

  // Real mode: the profile row is keyed by the logged-in Supabase user id.
  // Cookie mode (test / local dev): mint an id and remember it in a cookie.
  const cookieMode = isTestMode() || !isSupabaseConfigured();
  let userId: string;
  if (cookieMode) {
    userId = crypto.randomUUID();
  } else {
    const { data } = await getServerSupabase().auth.getUser();
    if (!data.user) throw new Error("Not authenticated — please log in first.");
    userId = data.user.id;
  }
  const now = new Date().toISOString(); // edge: real time is fine here

  await store.saveUser({
    id: userId,
    pathway: "returner",
    receptiveLevel: estimate.receptive,
    productiveLevel: estimate.productive,
    confidence: estimate.confidence,
    peakLevel: payload.background.peakLevel,
    yearsSinceActiveUse: payload.background.yearsSinceActiveUse,
    readsSpanish: payload.background.readsSpanish,
    goals: payload.goals,
    topics: payload.topics,
    correctionIntensity: "standard",
    streakCount: 0,
    lastActiveDate: null,
    createdAt: now,
  });

  await store.saveAssessment({
    id: crypto.randomUUID(),
    userId,
    receptive: estimate.receptive,
    productive: estimate.productive,
    confidence: estimate.confidence,
    gaps: estimate.gaps,
    createdAt: now,
  });

  if (cookieMode) setCurrentUserId(userId);
  return { ok: true };
}
