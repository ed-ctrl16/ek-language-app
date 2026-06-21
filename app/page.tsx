import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { GapBar } from "@/components/ui/GapBar";
import { computeGap, toBandLabel } from "@/lib/levels/cefr";
import { getCurrentUserId } from "@/lib/session/currentUser";
import { getStore } from "@/lib/store";
import { isTestMode } from "@/lib/testkit/testMode";

/**
 * Dashboard. Reads the current Returner from the store; with no profile yet it
 * sends the user to onboarding. The gap is the headline visual (Iteration 1).
 * The session CTA stays a disabled stub until Iteration 5.
 */
export default async function DashboardPage() {
  const userId = getCurrentUserId();
  if (!userId) redirect("/onboarding");

  const store = await getStore();
  const user = await store.getUser(userId);
  if (!user) redirect("/onboarding");

  const gap = computeGap(user.receptiveLevel, user.productiveLevel);
  const receptiveLabel = toBandLabel(user.receptiveLevel, user.confidence);
  const productiveLabel = toBandLabel(user.productiveLevel, user.confidence);

  const assessments = await store.listAssessments(userId);
  const observedGaps = assessments.at(-1)?.gaps ?? [];

  return (
    <AppShell
      rightPanel={
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeading>Streak</CardHeading>
            <p className="text-4xl font-bold text-brand">
              {user.streakCount} days
            </p>
          </Card>
          <Card>
            <CardHeading>Recent corrections</CardHeading>
            <p className="text-base text-brand">
              Nothing yet — finish a session to see fixes here.
            </p>
          </Card>
        </div>
      }
    >
      <header className="mb-8">
        <h1 className="text-5xl font-bold uppercase text-heading md:text-6xl">
          ¡Hola otra vez!
        </h1>
        {isTestMode() ? (
          <p
            data-testid="test-mode-badge"
            className="mt-2 inline-block rounded border-4 border-ink bg-brand-quaternary px-3 py-1 text-sm font-bold uppercase text-ink"
          >
            Test mode
          </p>
        ) : null}
      </header>

      <div className="mb-8" data-testid="today-session">
        <Card>
          <CardHeading>Today&apos;s session</CardHeading>
          <p className="mb-6 text-lg text-brand">
            The full daily session — a few varied exercises in ~17 minutes —
            arrives in Iteration 5. For now, try a reactivation warm-up.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button disabled>Full session (Iteration 5)</Button>
            <Link
              href="/warmup"
              data-testid="warmup-link"
              className="inline-flex rounded bg-brand-tertiary px-8 py-3 text-xl font-bold uppercase text-brand-secondary shadow-hard-sm transition-[box-shadow] duration-500 [transform:skewX(-15deg)] hover:shadow-hard-lg"
            >
              <span className="[transform:skewX(15deg)]">Start warm-up</span>
            </Link>
            <Link
              href="/bridge"
              data-testid="bridge-link"
              className="inline-flex rounded bg-brand-quaternary px-8 py-3 text-xl font-bold uppercase text-ink shadow-hard-sm transition-[box-shadow] duration-500 [transform:skewX(-15deg)] hover:shadow-hard-lg"
            >
              <span className="[transform:skewX(15deg)]">Bridge drill</span>
            </Link>
            <Link
              href="/conversation"
              data-testid="conversation-link"
              className="inline-flex rounded bg-brand-tertiary px-8 py-3 text-xl font-bold uppercase text-brand-secondary shadow-hard-sm transition-[box-shadow] duration-500 [transform:skewX(-15deg)] hover:shadow-hard-lg"
            >
              <span className="[transform:skewX(15deg)]">Conversation</span>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeading>The gap</CardHeading>
        <GapBar
          receptiveLabel={receptiveLabel}
          productiveLabel={productiveLabel}
          productivePct={gap.productivePct}
          receptivePct={gap.receptivePct}
        />
        {gap.steps === 0 ? (
          <p className="mt-4 text-base text-brand">
            Understanding and speaking are level — now we keep them growing
            together.
          </p>
        ) : (
          <p className="mt-4 text-base text-brand">
            About {gap.steps} CEFR step{gap.steps > 1 ? "s" : ""} between what you
            understand and what you can say. That&apos;s what we&apos;ll close.
          </p>
        )}

        {observedGaps.length > 0 ? (
          <div className="mt-6 border-t-divider border-ink pt-4">
            <p className="mb-2 text-sm font-semibold uppercase text-brand">
              What we noticed in your diagnostic
            </p>
            <ul
              data-testid="observed-gaps"
              className="list-disc pl-5 text-base text-brand"
            >
              {observedGaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-brand opacity-60">
          This is an estimate from a short diagnostic — speaking is the
          hardest skill to judge from a few answers, so we recalibrate it as you
          speak more.
        </p>
      </Card>
    </AppShell>
  );
}
