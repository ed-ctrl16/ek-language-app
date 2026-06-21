import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { getAIClient } from "@/lib/ai";
import { SeededRandom } from "@/lib/random/Random";
import {
  DEFAULT_SESSION_BUDGET_MIN,
  planDailySession,
} from "@/lib/session/orchestrator";
import { EXERCISES } from "@/lib/session/registry";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { buildWarmupBlock } from "@/lib/exercises/reactivation/warmup";
import { generateBridgeDrill } from "@/lib/exercises/bridge/generate";
import { patternForLevel } from "@/lib/exercises/bridge/patterns";
import { buildMix, seedFromString } from "@/lib/exercises/bridge/mix";
import { pickMission } from "@/lib/exercises/conversation/missions";
import { SessionPlayer } from "./SessionPlayer";

/**
 * The daily session (Iteration 5) — the whole product loop. Plans an interleaved,
 * time-budgeted set of blocks and fetches each one's data, then hands off to the
 * SessionPlayer which runs them in sequence and rolls the streak at the end.
 */
export default async function SessionPage() {
  const userId = getCurrentUserId();
  if (!userId) redirect("/onboarding");
  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const plan = planDailySession(
    EXERCISES,
    DEFAULT_SESSION_BUDGET_MIN,
    new SeededRandom(seedFromString(userId)),
  );

  const now = new Date();

  // Warm-up block (seed on first ever visit).
  let items = await store.listItems(userId);
  if (items.length === 0) {
    const seeded = seedItemsForPeak(user.peakLevel, userId, now);
    await store.saveItems(seeded);
    items = seeded;
  }
  const warmupItems = buildWarmupBlock(items, now, 5).map((i) => ({
    id: i.id,
    prompt: i.prompt,
    target: i.target,
    level: i.level,
  }));

  // Bridge drill + Mix scramble.
  const ai = await getAIClient();
  const { pattern, level } = patternForLevel(user.productiveLevel);
  const bridgeDrill = await generateBridgeDrill(ai, { pattern, level });
  const bridgeMix = buildMix(
    bridgeDrill.make.modelAnswer,
    new SeededRandom(seedFromString(bridgeDrill.make.modelAnswer)),
  );

  // Conversation mission.
  const mission = pickMission(user.productiveLevel);

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
