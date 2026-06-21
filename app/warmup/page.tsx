import { redirect } from "next/navigation";
import { getCurrentUserId, authRedirectPath } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { getAIClient } from "@/lib/ai";
import { prepareWarmupItems } from "@/lib/exercises/reactivation/prepare";
import { WarmupExercise } from "./WarmupExercise";

/**
 * Reactivation Warm-up. Seeds savings-paradigm items on first visit, serves the
 * due block, and tops up with freshly generated items when due items run short
 * (so repeat sessions get new content).
 */
export default async function WarmupPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(authRedirectPath());

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const ai = await getAIClient();
  const items = await prepareWarmupItems(
    store,
    ai,
    userId,
    user.peakLevel,
    user.productiveLevel,
    new Date(),
  );

  return <WarmupExercise items={items} />;
}
