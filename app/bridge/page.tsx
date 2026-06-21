import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { getAIClient } from "@/lib/ai";
import { generateBridgeDrill } from "@/lib/exercises/bridge/generate";
import { patternForLevel } from "@/lib/exercises/bridge/patterns";
import { BridgeDrillExercise } from "./BridgeDrillExercise";

/**
 * Bridge Drill (Iteration 3) — the signature mechanic. Picks a pattern at the
 * user's productive level and generates the drill via the AI seam (deterministic
 * under MockAIClient in test mode).
 */
export default async function BridgePage() {
  const userId = getCurrentUserId();
  if (!userId) redirect("/onboarding");

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const { pattern, level } = patternForLevel(user.productiveLevel);
  const ai = await getAIClient();
  const drill = await generateBridgeDrill(ai, { pattern, level });

  return <BridgeDrillExercise drill={drill} />;
}
