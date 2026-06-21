"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import type { CefrLevel } from "@/lib/levels/cefr";
import {
  DIAGNOSTIC_CLOZE,
  DIAGNOSTIC_CONVERSATION,
  FIRST_WIN_OPENER,
  GOAL_OPTIONS,
  LEARNING_CONTEXTS,
  PEAK_LEVEL_OPTIONS,
  TOPIC_OPTIONS,
} from "@/lib/onboarding/content";
import { completeOnboarding, getFirstWinReply } from "./actions";

type Step =
  | "niche"
  | "waitlist"
  | "background"
  | "diagnostic"
  | "goals"
  | "firstwin";

const fieldClass =
  "block w-full rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-lg text-brand shadow-hard-xs focus:border-brand-tertiary focus:outline-none";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("niche");
  const [submitting, setSubmitting] = React.useState(false);

  // Collected data
  const [peakLevel, setPeakLevel] = React.useState<CefrLevel>("B1");
  const [years, setYears] = React.useState(5);
  const [context, setContext] = React.useState<string>(LEARNING_CONTEXTS[0]);
  const [readsSpanish, setReadsSpanish] = React.useState(false);
  const [cloze, setCloze] = React.useState<string[]>(
    DIAGNOSTIC_CLOZE.map(() => ""),
  );
  const [convo, setConvo] = React.useState<string[]>(
    DIAGNOSTIC_CONVERSATION.map(() => ""),
  );
  const [goals, setGoals] = React.useState<string[]>([]);
  const [topics, setTopics] = React.useState<string[]>([]);
  const [firstWin, setFirstWin] = React.useState("");
  const [firstWinReply, setFirstWinReply] = React.useState<string | null>(null);

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  async function sendFirstWin() {
    setSubmitting(true);
    try {
      setFirstWinReply(await getFirstWinReply(firstWin));
    } finally {
      setSubmitting(false);
    }
  }

  async function finish() {
    setSubmitting(true);
    try {
      const answers = [
        ...DIAGNOSTIC_CLOZE.map((prompt, i) => ({
          prompt,
          answer: cloze[i] ?? "",
        })),
        ...DIAGNOSTIC_CONVERSATION.map((prompt, i) => ({
          prompt,
          answer: convo[i] ?? "",
        })),
        { prompt: FIRST_WIN_OPENER, answer: firstWin },
      ];
      await completeOnboarding({
        background: {
          peakLevel,
          yearsSinceActiveUse: Number(years) || 0,
          learningContext: context,
          readsSpanish,
        },
        answers,
        goals,
        topics,
      });
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold uppercase text-heading md:text-5xl">
        Welcome to Habla
      </h1>
      <p className="mb-8 text-lg text-body">
        Let&apos;s bring back the Spanish you already have.
      </p>

      {step === "niche" && (
        <Card>
          <CardHeading>How would you describe your Spanish?</CardHeading>
          <div className="flex flex-col gap-4">
            <button
              data-testid="niche-returner"
              onClick={() => setStep("background")}
              className="rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-left text-lg text-brand shadow-hard-xs hover:bg-brand-quaternary hover:text-ink"
            >
              I formally studied Spanish before but haven&apos;t kept it up.
            </button>
            <button
              data-testid="niche-absorber"
              onClick={() => setStep("waitlist")}
              className="rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-left text-lg text-brand shadow-hard-xs hover:bg-brand-quaternary hover:text-ink"
            >
              I&apos;ve been around Spanish a lot but never formally studied it.
            </button>
            <button
              data-testid="niche-none"
              onClick={() => setStep("waitlist")}
              className="rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-left text-lg text-brand shadow-hard-xs hover:bg-brand-quaternary hover:text-ink"
            >
              I&apos;ve never really had any Spanish exposure.
            </button>
          </div>
        </Card>
      )}

      {step === "waitlist" && (
        <Card>
          <CardHeading>We&apos;re building that next</CardHeading>
          <p className="mb-6 text-lg text-brand">
            Habla is built first for people reactivating Spanish they formally
            studied. The pathway for absorbed-but-never-studied learners is
            coming — we&apos;ll save your spot.
          </p>
          <Button variant="tertiary" onClick={() => setStep("niche")}>
            Actually, I did study formally
          </Button>
        </Card>
      )}

      {step === "background" && (
        <Card>
          <CardHeading>A little background</CardHeading>
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="peak"
                className="mb-3 block text-base font-semibold uppercase text-brand"
              >
                Best level you ever reached
              </label>
              <select
                id="peak"
                value={peakLevel}
                onChange={(e) => setPeakLevel(e.target.value as CefrLevel)}
                className={fieldClass}
              >
                {PEAK_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="years"
                className="mb-3 block text-base font-semibold uppercase text-brand"
              >
                Years since you used it regularly
              </label>
              <input
                id="years"
                type="number"
                inputMode="numeric"
                min={0}
                max={80}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="context"
                className="mb-3 block text-base font-semibold uppercase text-brand"
              >
                Where you learned it
              </label>
              <select
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className={fieldClass}
              >
                {LEARNING_CONTEXTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 text-lg text-brand">
              <input
                type="checkbox"
                checked={readsSpanish}
                onChange={(e) => setReadsSpanish(e.target.checked)}
                className="h-6 w-6 border-4 border-ink"
              />
              I still read Spanish sometimes
            </label>
            <Button
              variant="secondary"
              data-testid="background-next"
              onClick={() => setStep("diagnostic")}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === "diagnostic" && (
        <Card>
          <CardHeading>Quick check — no pressure</CardHeading>
          <p className="mb-6 text-base text-brand">
            This is an adaptive estimate, not an exam. We&apos;ll recalibrate as
            you speak more.
          </p>
          <div className="flex flex-col gap-6">
            {DIAGNOSTIC_CLOZE.map((prompt, i) => (
              <div key={prompt}>
                <label
                  htmlFor={`cloze-${i}`}
                  className="mb-3 block text-base font-semibold uppercase text-brand"
                >
                  {prompt}
                </label>
                <input
                  id={`cloze-${i}`}
                  value={cloze[i]}
                  onChange={(e) =>
                    setCloze((c) =>
                      c.map((v, j) => (j === i ? e.target.value : v)),
                    )
                  }
                  className={fieldClass}
                />
              </div>
            ))}
            <p className="border-t-divider border-ink pt-6 text-base font-semibold uppercase text-brand">
              Now two open questions — speak or type your answer in Spanish:
            </p>
            {DIAGNOSTIC_CONVERSATION.map((prompt, i) => (
              <VoiceTextInput
                key={prompt}
                id={`convo-${i}`}
                label={prompt}
                helper="A sentence or two is plenty. Tap the mic to speak, or just type."
                placeholder="Tu respuesta en español…"
                value={convo[i] ?? ""}
                onChange={(v) =>
                  setConvo((c) => c.map((x, j) => (j === i ? v : x)))
                }
              />
            ))}
            <Button
              variant="secondary"
              data-testid="diagnostic-next"
              onClick={() => setStep("goals")}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === "goals" && (
        <Card>
          <CardHeading>What&apos;s this for?</CardHeading>
          <p className="mb-3 text-base font-semibold uppercase text-brand">
            Goals
          </p>
          <div className="mb-6 flex flex-wrap gap-3">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGoals((l) => toggle(l, g))}
                className={
                  "rounded-full border-4 border-ink px-4 py-2 text-base font-bold uppercase " +
                  (goals.includes(g)
                    ? "bg-brand text-brand-secondary"
                    : "bg-brand-secondary text-brand")
                }
              >
                {g}
              </button>
            ))}
          </div>
          <p className="mb-3 text-base font-semibold uppercase text-brand">
            Topics
          </p>
          <div className="mb-6 flex flex-wrap gap-3">
            {TOPIC_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTopics((l) => toggle(l, t))}
                className={
                  "rounded-full border-4 border-ink px-4 py-2 text-base font-bold uppercase " +
                  (topics.includes(t)
                    ? "bg-brand text-brand-secondary"
                    : "bg-brand-secondary text-brand")
                }
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            data-testid="goals-next"
            onClick={() => setStep("firstwin")}
          >
            Continue
          </Button>
        </Card>
      )}

      {step === "firstwin" && (
        <Card>
          <CardHeading>Your first win</CardHeading>
          <p className="mb-4 text-base text-brand opacity-70">
            Answer the question below — speak it or type it, in any mix of
            Spanish and English. Then tap “Say it” and I&apos;ll reply.
          </p>
          <div className="mb-6 rounded border-4 border-ink bg-brand-soft px-5 py-4">
            <p className="text-xl font-bold text-brand">{FIRST_WIN_OPENER}</p>
            <p className="mt-1 text-base text-brand opacity-70">
              (Tell me: why did you first learn Spanish?)
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <VoiceTextInput
              id="firstwin"
              label="Your answer"
              helper="Speak or type — Spanish, English, or a mix is totally fine."
              placeholder="e.g. Lo aprendí en la universidad…"
              value={firstWin}
              onChange={setFirstWin}
            />
            {!firstWinReply ? (
              <Button
                variant="secondary"
                data-testid="firstwin-send"
                disabled={submitting || firstWin.trim().length === 0}
                onClick={sendFirstWin}
              >
                {submitting ? "…" : "Say it"}
              </Button>
            ) : (
              <>
                <div className="rounded border-4 border-ink bg-brand-soft px-5 py-4 text-lg text-brand">
                  {firstWinReply}
                </div>
                <p className="text-lg font-bold uppercase text-brand">
                  You just said that in Spanish. That&apos;s the gap closing.
                </p>
                <Button
                  variant="secondary"
                  data-testid="finish"
                  disabled={submitting}
                  onClick={finish}
                >
                  {submitting ? "Setting up…" : "See my gap"}
                </Button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
