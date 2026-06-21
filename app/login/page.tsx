import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { isTestMode } from "@/lib/testkit/testMode";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  // Already signed in → straight to the app.
  if ((await getCurrentUserId()) !== null) redirect("/");

  // In cookie mode (test / local dev) there's no login — go to onboarding.
  if (isTestMode() || !isSupabaseConfigured()) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-screen max-w-[480px] px-4 py-16">
      <h1 className="mb-2 text-5xl font-bold uppercase text-heading">Habla</h1>
      <p className="mb-8 text-lg text-body">
        Bring back the Spanish you already have.
      </p>
      <LoginForm />
    </div>
  );
}
