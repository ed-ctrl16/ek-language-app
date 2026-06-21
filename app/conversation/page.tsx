import { redirect } from "next/navigation";
import { getCurrentUserId, authRedirectPath } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { missionForRotation } from "@/lib/exercises/conversation/missions";
import { ConversationMissionUI } from "./ConversationMissionUI";

/**
 * Guided Conversation Mission (Iteration 4). A short, scenario-based mission
 * with a target pattern and a clear win — structured pressure, not open chat.
 */
export default async function ConversationPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(authRedirectPath());
  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const rotation = (await store.listSessions(userId)).length;
  const mission = missionForRotation(user.productiveLevel, rotation);
  return <ConversationMissionUI mission={mission} />;
}
