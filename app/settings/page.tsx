import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const userId = getCurrentUserId();
  if (!userId) redirect("/onboarding");
  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold uppercase text-heading md:text-5xl">
        Settings
      </h1>
      <SettingsForm current={user.correctionIntensity} />
      <p className="mt-8">
        <Link href="/" className="text-base font-bold uppercase text-heading underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
