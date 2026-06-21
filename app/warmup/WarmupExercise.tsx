"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { matchesCloze } from "@/lib/srs/matcher";
import { recordWarmupAttempt } from "./actions";

export interface WarmupItem {
  id: string;
  prompt: string;
  target: string;
  level: string;
}

const backLink = (
  <Link
    href="/"
    data-testid="warmup-back"
    className="text-base font-bold uppercase text-brand underline"
  >
    Back to dashboard
  </Link>
);

export function WarmupExercise({ items }: { items: WarmupItem[] }) {
  const [index, setIndex] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [lastCorrect, setLastCorrect] = React.useState(false);
  const [reactivated, setReactivated] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  if (items.length === 0) {
    return (
      <Shell>
        <Card>
          <CardHeading>Nothing to reactivate right now</CardHeading>
          <p className="mb-6 text-lg text-brand">
            You&apos;re all caught up — come back later for the next batch.
          </p>
          {backLink}
        </Card>
      </Shell>
    );
  }

  const current = items[index]!;
  const done = index >= items.length;

  function advance() {
    if (index + 1 >= items.length) {
      setIndex(items.length); // → done
    } else {
      setIndex(index + 1);
      setAnswer("");
      setRevealed(false);
    }
  }

  async function check() {
    const correct = matchesCloze(current.target, answer);
    setLastCorrect(correct);
    setRevealed(true);
    if (correct) setReactivated((n) => n + 1);
    setBusy(true);
    try {
      await recordWarmupAttempt({
        itemId: current.id,
        answer,
        correct,
        known: false,
      });
    } finally {
      setBusy(false);
    }
  }

  async function markKnown() {
    setReactivated((n) => n + 1);
    setBusy(true);
    try {
      await recordWarmupAttempt({
        itemId: current.id,
        answer: "",
        correct: true,
        known: true,
      });
    } finally {
      setBusy(false);
    }
    advance();
  }

  if (done) {
    return (
      <Shell>
        <Card>
          <CardHeading>Warm-up complete</CardHeading>
          <p
            data-testid="warmup-recap"
            className="mb-6 text-2xl font-bold text-brand"
          >
            You reactivated {reactivated} of {items.length}.
          </p>
          <p className="mb-6 text-base text-brand">
            Short and often beats long and rare — see you tomorrow.
          </p>
          {backLink}
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <p
        data-testid="warmup-progress"
        className="mb-4 text-sm font-semibold uppercase text-body-subtle"
      >
        Reactivation warm-up · {index + 1} of {items.length}
      </p>
      <Card>
        <CardHeading>Fill the blank</CardHeading>
        <p className="mb-6 text-2xl text-brand">{current.prompt}</p>

        <VoiceTextInput
          id="warmup-answer"
          label="Your answer"
          helper="Type the missing word, or tap the mic to say it."
          placeholder="…"
          value={answer}
          onChange={setAnswer}
        />

        {!revealed ? (
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              variant="secondary"
              data-testid="warmup-check"
              disabled={busy || answer.trim().length === 0}
              onClick={check}
            >
              Check
            </Button>
            <Button
              variant="tertiary"
              data-testid="warmup-known"
              disabled={busy}
              onClick={markKnown}
            >
              I already know this
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <div
              className={
                "mb-4 rounded border-4 border-ink px-5 py-4 text-lg " +
                (lastCorrect
                  ? "bg-brand-soft text-brand"
                  : "bg-brand-secondary text-brand")
              }
            >
              {lastCorrect ? (
                <strong>¡Correcto!</strong>
              ) : (
                <>
                  <strong>Not quite.</strong> The answer is{" "}
                  <strong>{current.target}</strong>.
                </>
              )}
            </div>
            <Button variant="secondary" data-testid="warmup-next" onClick={advance}>
              {index + 1 >= items.length ? "Finish" : "Next"}
            </Button>
          </div>
        )}
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold uppercase text-heading md:text-5xl">
        Warm-up
      </h1>
      {children}
    </div>
  );
}
