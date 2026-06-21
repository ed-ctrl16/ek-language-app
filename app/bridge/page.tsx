import { redirect } from "next/navigation";
import { getCurrentUserId, authRedirectPath } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { getAIClient } from "@/lib/ai";
import { generateBridgeDrill } from "@/lib/exercises/bridge/generate";
import { patternForRotation } from "@/lib/exercises/bridge/patterns";
import { buildMix, seedFromString } from "@/lib/exercises/bridge/mix";
import { SeededRandom } from "@/lib/random/Random";
import { BridgeDrillExercise } from "./BridgeDrillExercise";

/**
 * Bridge Drill (Iteration 3) — the signature mechanic. Picks a pattern at the
 * user's productive level and generates the drill via the AI seam (deterministic
 * under MockAIClient in test mode).
 */
export default async function BridgePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(authRedirectPath());

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const rotation = (await store.listSessions(userId)).length;
  const { pattern, level } = patternForRotation(user.productiveLevel, rotation);
  const ai = await getAIClient();
  const drill = await generateBridgeDrill(ai, { pattern, level });

  // Derive the "Mix it" scramble deterministically from the model sentence.
  const mix = buildMix(
    drill.make.modelAnswer,
    new SeededRandom(seedFromString(drill.make.modelAnswer)),
  );

  return <BridgeDrillExercise drill={drill} mix={mix} />;
}
