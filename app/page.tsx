import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { GapBar } from "@/components/ui/GapBar";
import { isTestMode } from "@/lib/testkit/testMode";
import { SEED_RETURNER } from "@/lib/testkit/seed";

/**
 * Iteration 0 dashboard placeholder. Proves the shell, the design-system
 * primitives, and the gap visual render. Real onboarding/session wiring
 * arrives in Iterations 1 and 5.
 */
export default function DashboardPage() {
  const profile = SEED_RETURNER;
  const testMode = isTestMode();

  return (
    <AppShell
      rightPanel={
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeading>Streak</CardHeading>
            <p className="text-4xl font-bold text-brand">
              {profile.streakCount} days
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
        {testMode ? (
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
            A short, varied set of exercises — about 17 minutes.
          </p>
          <Button disabled>Start (coming in Iteration 5)</Button>
        </Card>
      </div>

      <Card>
        <CardHeading>The gap</CardHeading>
        <GapBar
          receptiveLabel={profile.receptiveBand}
          productiveLabel={profile.productiveBand}
          productivePct={profile.productivePct}
          receptivePct={profile.receptivePct}
        />
      </Card>
    </AppShell>
  );
}
