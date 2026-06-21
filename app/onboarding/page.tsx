import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { isTestMode } from "@/lib/testkit/testMode";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const cookieMode = isTestMode() || !isSupabaseConfigured();
  const userId = await getCurrentUserId();

  if (userId) {
    // Already onboarded → straight to the app.
    const user = await (await getStore()).getUser(userId);
    if (user) redirect("/");
  } else if (!cookieMode) {
    // Real mode requires a logged-in account before onboarding.
    redirect("/login");
  }

  return <OnboardingWizard />;
}
