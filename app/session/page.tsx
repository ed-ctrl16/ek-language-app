import { redirect } from "next/navigation";
import { getCurrentUserId, authRedirectPath } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { getAIClient } from "@/lib/ai";
import { SeededRandom } from "@/lib/random/Random";
import {
  DEFAULT_SESSION_BUDGET_MIN,
  planDailySession,
} from "@/lib/session/orchestrator";
import { EXERCISES } from "@/lib/session/registry";
import { prepareWarmupItems } from "@/lib/exercises/reactivation/prepare";
import { generateBridgeDrill } from "@/lib/exercises/bridge/generate";
import { patternForRotation } from "@/lib/exercises/bridge/patterns";
import { buildMix, seedFromString } from "@/lib/exercises/bridge/mix";
import { missionForRotation } from "@/lib/exercises/conversation/missions";
import { SessionPlayer } from "./SessionPlayer";

/**
 * The daily session — the whole product loop. Plans an interleaved, time-budgeted
 * set of blocks, fetches each one's data, then hands off to the SessionPlayer.
 * Content rotates by sessions completed so consecutive sessions (even same day)
 * vary; the warm-up tops up with freshly generated items as the queue empties.
 */
export default async function SessionPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(authRedirectPath());
  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const now = new Date();
  const ai = await getAIClient();
  // Rotation index: how many sessions completed so far → new content each session.
  const rotation = (await store.listSessions(userId)).length;

  const plan = planDailySession(
    EXERCISES,
    DEFAULT_SESSION_BUDGET_MIN,
    new SeededRandom(seedFromString(userId) + rotation),
  );

  // Warm-up (seed + due + top-up with generated content).
  const warmupItems = await prepareWarmupItems(
    store,
    ai,
    userId,
    user.peakLevel,
    user.productiveLevel,
    now,
  );

  // Bridge drill — rotate the target pattern.
  const { pattern, level } = patternForRotation(user.productiveLevel, rotation);
  const bridgeDrill = await generateBridgeDrill(ai, { pattern, level });
  const bridgeMix = buildMix(
    bridgeDrill.make.modelAnswer,
    new SeededRandom(seedFromString(bridgeDrill.make.modelAnswer)),
  );

  // Conversation — rotate the mission.
  const mission = missionForRotation(user.productiveLevel, rotation);

  return (
    <SessionPlayer
      data={{
        blocks: plan.blocks.map((b) => ({ id: b.id, label: b.label })),
        warmupItems,
        bridgeDrill,
        bridgeMix,
        mission,
      }}
    />
  );
}
