import { redirect } from "next/navigation";
import { getCurrentUserId, authRedirectPath } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { buildWarmupBlock } from "@/lib/exercises/reactivation/warmup";
import { WarmupExercise } from "./WarmupExercise";

/**
 * Reactivation Warm-up (Iteration 2). Standalone exercise route — runnable
 * before the daily-session orchestrator exists. Seeds savings-paradigm items
 * on first visit (idempotent), then serves a due block.
 */
export default async function WarmupPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(authRedirectPath());

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const now = new Date();
  let items = await store.listItems(userId);
  if (items.length === 0) {
    const seeded = seedItemsForPeak(user.peakLevel, userId, now);
    await store.saveItems(seeded);
    items = seeded;
  }

  const block = buildWarmupBlock(items, now, 5).map((i) => ({
    id: i.id,
    prompt: i.prompt,
    target: i.target,
    level: i.level,
  }));

  return <WarmupExercise items={block} />;
}
