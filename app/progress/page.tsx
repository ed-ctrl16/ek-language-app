import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardHeading } from "@/components/ui/Card";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { gapOverTime } from "@/lib/levels/gapSeries";

/**
 * Progress (Iteration 5): the headline gap trend over time, the day-streak, and
 * how many sessions/attempts the user has logged. Read-only.
 */
export default async function ProgressPage() {
  const userId = getCurrentUserId();
  if (!userId) redirect("/onboarding");
  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const [assessments, sessions, attempts] = await Promise.all([
    store.listAssessments(userId),
    store.listSessions(userId),
    store.listAttempts(userId),
  ]);
  const series = gapOverTime(assessments);

  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold uppercase text-heading md:text-5xl">
        Progress
      </h1>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeading>At a glance</CardHeading>
          <div className="flex flex-wrap gap-8 text-brand">
            <Stat label="Day streak" value={`${user.streakCount}`} />
            <Stat label="Sessions" value={`${sessions.length}`} />
            <Stat label="Things practised" value={`${attempts.length}`} />
          </div>
        </Card>

        <Card>
          <CardHeading>The gap over time</CardHeading>
          {series.length === 0 ? (
            <p className="text-base text-brand">No assessments yet.</p>
          ) : (
            <ul data-testid="gap-series" className="flex flex-col gap-2 text-brand">
              {series.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-28 text-sm opacity-70">
                    {p.date.slice(0, 10)}
                  </span>
                  <span
                    className="inline-block h-4 rounded-full bg-brand-quaternary"
                    style={{ width: `${Math.max(8, p.steps * 40)}px` }}
                    aria-hidden
                  />
                  <span className="text-sm font-bold">
                    {p.steps} step{p.steps === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-brand opacity-60">
            Down is the goal — fewer steps between what you understand and what
            you can say.
          </p>
        </Card>
      </div>

      <p className="mt-8">
        <Link href="/" className="text-base font-bold uppercase text-heading underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-sm font-semibold uppercase opacity-70">{label}</div>
    </div>
  );
}
