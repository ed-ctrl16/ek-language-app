"use server";

import { z } from "zod";
import { getStore } from "@/lib/store";
import { getCurrentUserId } from "@/lib/session/currentUser";

const input = z.object({
  correctionIntensity: z.enum(["minimal", "standard", "detailed"]),
});

/** Update how many corrections conversations surface (retention guardrail control). */
export async function setCorrectionIntensity(
  raw: z.infer<typeof input>,
): Promise<{ ok: boolean }> {
  const { correctionIntensity } = input.parse(raw);
  const userId = getCurrentUserId();
  if (!userId) return { ok: false };

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) return { ok: false };

  await store.saveUser({ ...user, correctionIntensity });
  return { ok: true };
}
