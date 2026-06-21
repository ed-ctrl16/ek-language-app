"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { WebVoiceClient } from "@/lib/voice/WebVoiceClient";
import { matchesCloze, matchesRepeat } from "@/lib/srs/matcher";
import { isMixCorrect, type MixStep } from "@/lib/exercises/bridge/mix";
import { nextStep } from "@/lib/exercises/bridge/steps";
import {
  escalate,
  firstWordCue,
  isMaxRung,
  rungAt,
  twoChoices,
} from "@/lib/exercises/bridge/stuck";
import type {
  BridgeDrill,
  BridgeStep,
  MakeAssessment,
} from "@/lib/exercises/bridge/types";
import { assessMakeAction, recordBridgeAttempt } from "./actions";

const STEP_TITLES: Record<BridgeStep, string> = {
  hear: "Hear it",
  repeat: "Repeat it",
  mod: "Mod it",
  mix: "Mix it",
  make: "Make it",
  done: "Done",
};

export function BridgeDrillExercise({
  drill,
  mix,
  onComplete,
}: {
  drill: BridgeDrill;
  mix: MixStep;
  onComplete?: () => void;
}) {
  const [step, setStep] = React.useState<BridgeStep>("hear");
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);
  const [stuckLevel, setStuckLevel] = React.useState(-1); // -1 = no hint shown
  const [flagged, setFlagged] = React.useState(false);
  const [verdict, setVerdict] = React.useState<MakeAssessment | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [assembled, setAssembled] = React.useState<number[]>([]); // chunk indices, in order
  const [voice] = React.useState(() => new WebVoiceClient());

  function goto(next: BridgeStep) {
    setStep(next);
    setAnswer("");
    setRevealed(false);
    setCorrect(false);
    setStuckLevel(-1);
    setVerdict(null);
    setAssembled([]);
  }

  function hint() {
    setStuckLevel((lvl) => {
      const next = lvl < 0 ? 0 : escalate(lvl);
      if (isMaxRung(next)) setFlagged(true);
      return next;
    });
  }

  // Hint content for the current production step.
  const hintTarget =
    step === "mod"
      ? drill.mod.target
      : step === "mix"
        ? mix.answer
        : drill.make.modelAnswer;
  const hintDistractor = step === "mod" ? drill.mod.distractor : "";

  function renderHint() {
    if (stuckLevel < 0) return null;
    const rung = rungAt(stuckLevel);
    let body: React.ReactNode;
    switch (rung) {
      case "wait":
        body = "Take your time — say it when you're ready.";
        break;
      case "first-word":
        body = `Starts with: ${firstWordCue(hintTarget)}`;
        break;
      case "choices":
        body = hintDistractor ? (
          <span className="flex flex-wrap gap-3">
            {twoChoices(hintTarget, hintDistractor).map((c) => (
              <button
                key={c}
                onClick={() => setAnswer(c)}
                className="rounded border-4 border-ink bg-brand-secondary px-4 py-2 font-bold text-brand"
              >
                {c}
              </button>
            ))}
          </span>
        ) : (
          `Here's one way: ${hintTarget}`
        );
        break;
      case "model":
        body = (
          <>
            Model answer: <strong>{hintTarget}</strong>
          </>
        );
        break;
      case "change-one-word":
        body = "Now say it again, changing just one word.";
        break;
      case "flag":
        body = "No worries — we'll bring this one back tomorrow.";
        break;
    }
    return (
      <div
        data-testid="bridge-hint-body"
        className="mt-4 rounded border-4 border-ink bg-brand-soft px-5 py-4 text-lg text-brand"
      >
        {body}
      </div>
    );
  }

  const hintButton = (
    <Button variant="tertiary" data-testid="bridge-hint" onClick={hint}>
      {stuckLevel < 0 ? "I'm stuck" : "More help"}
    </Button>
  );

  // --- Steps -----------------------------------------------------------------

  if (step === "hear") {
    return (
      <Shell step="hear">
        <Card>
          <CardHeading>Hear it</CardHeading>
          <p className="mb-2 text-3xl text-brand">{drill.hear.sentence}</p>
          <p className="mb-6 text-lg text-brand opacity-70">
            {drill.hear.translation}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="tertiary"
              onClick={() => voice.speak(drill.hear.sentence)}
            >
              ▶ Play
            </Button>
            <Button
              variant="secondary"
              data-testid="bridge-understood"
              onClick={() => goto(nextStep("hear"))}
            >
              I understood
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  if (step === "repeat") {
    return (
      <Shell step="repeat">
        <Card>
          <CardHeading>Repeat it</CardHeading>
          <p className="mb-6 text-2xl text-brand">{drill.hear.sentence}</p>
          <VoiceTextInput
            id="bridge-answer"
            label="Say it back (or type it)"
            helper="Doesn't need to be word-perfect."
            value={answer}
            onChange={setAnswer}
          />
          {!revealed ? (
            <div className="mt-6">
              <Button
                variant="secondary"
                data-testid="bridge-check"
                disabled={answer.trim().length === 0}
                onClick={() => {
                  setCorrect(matchesRepeat(drill.hear.sentence, answer));
                  setRevealed(true);
                }}
              >
                Check
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <p className="mb-4 text-lg text-brand">
                {correct ? "¡Bien! That's it." : "Close — keep that rhythm."}
              </p>
              <Button
                variant="secondary"
                data-testid="bridge-next"
                onClick={() => goto(nextStep("repeat"))}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </Shell>
    );
  }

  if (step === "mod") {
    return (
      <Shell step="mod">
        <Card>
          <CardHeading>Mod it</CardHeading>
          <p className="mb-6 text-2xl text-brand">{drill.mod.cloze}</p>
          <VoiceTextInput
            id="bridge-answer"
            label="Fill the blank"
            helper="Say or type the missing word."
            value={answer}
            onChange={setAnswer}
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              variant="secondary"
              data-testid="bridge-check"
              disabled={answer.trim().length === 0}
              onClick={() => {
                setCorrect(matchesCloze(drill.mod.target, answer));
                setRevealed(true);
              }}
            >
              Check
            </Button>
            {hintButton}
            {(revealed && correct) || flagged ? (
              <Button
                variant="secondary"
                data-testid="bridge-next"
                onClick={() => goto(nextStep("mod"))}
              >
                Next
              </Button>
            ) : null}
          </div>
          {revealed ? (
            <p className="mt-4 text-lg text-brand">
              {correct ? "¡Correcto!" : "Not quite — try a hint."}
            </p>
          ) : null}
          {renderHint()}
        </Card>
      </Shell>
    );
  }

  if (step === "mix") {
    const assembledWords = assembled.map((i) => mix.chunks[i]!);
    const mixOk = isMixCorrect(assembledWords, mix.answer);
    return (
      <Shell step="mix">
        <Card>
          <CardHeading>Mix it</CardHeading>
          <p className="mb-2 text-base text-brand opacity-70">
            Tap the words in order to build a sentence with this pattern.
          </p>

          <div
            data-testid="mix-assembled"
            className="mb-4 min-h-[3.5rem] rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-xl text-brand"
          >
            {assembledWords.join(" ") || (
              <span className="opacity-40">…</span>
            )}
          </div>

          <div className="mb-2 flex flex-wrap gap-3">
            {mix.chunks.map((chunk, i) => (
              <button
                key={`${chunk}-${i}`}
                disabled={assembled.includes(i)}
                onClick={() => setAssembled((a) => [...a, i])}
                className="rounded border-4 border-ink bg-brand-secondary px-4 py-2 text-lg font-bold text-brand shadow-hard-xs disabled:opacity-30"
              >
                {chunk}
              </button>
            ))}
          </div>

          <button
            data-testid="mix-clear"
            onClick={() => setAssembled([])}
            className="mb-6 text-sm font-bold uppercase text-brand underline"
          >
            Clear
          </button>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              data-testid="bridge-check"
              disabled={assembled.length === 0}
              onClick={() => {
                setCorrect(mixOk);
                setRevealed(true);
              }}
            >
              Check
            </Button>
            {hintButton}
            {(revealed && correct) || flagged ? (
              <Button
                variant="secondary"
                data-testid="bridge-next"
                onClick={() => goto(nextStep("mix"))}
              >
                Next
              </Button>
            ) : null}
          </div>
          {revealed ? (
            <p className="mt-4 text-lg text-brand">
              {correct ? "¡Correcto!" : "Not in order yet — Clear and try again."}
            </p>
          ) : null}
          {renderHint()}
        </Card>
      </Shell>
    );
  }

  if (step === "make") {
    return (
      <Shell step="make">
        <Card>
          <CardHeading>Make it</CardHeading>
          <p className="mb-6 text-2xl text-brand">{drill.make.prompt}</p>
          <VoiceTextInput
            id="bridge-answer"
            label="Your sentence"
            helper="Use the pattern in a brand-new sentence."
            value={answer}
            onChange={setAnswer}
          />
          <div className="mt-6 flex flex-wrap gap-4">
            {!verdict ? (
              <Button
                variant="secondary"
                data-testid="bridge-submit"
                disabled={busy || answer.trim().length === 0}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setVerdict(
                      await assessMakeAction({
                        pattern: drill.pattern,
                        prompt: drill.make.prompt,
                        userAnswer: answer,
                      }),
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "…" : "Say it"}
              </Button>
            ) : null}
            {hintButton}
          </div>
          {renderHint()}
          {verdict ? (
            <div className="mt-6">
              <div className="mb-4 rounded border-4 border-ink bg-brand-soft px-5 py-4 text-lg text-brand">
                <p className="mb-1">
                  <strong>{verdict.ok ? "¡Bien hecho!" : "Good attempt."}</strong>
                </p>
                <p className="mb-1">
                  Natural version: <strong>{verdict.recast}</strong>
                </p>
                <p className="opacity-80">{verdict.note}</p>
              </div>
              <Button
                variant="secondary"
                data-testid="bridge-finish"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await recordBridgeAttempt({
                      promptShown: drill.make.prompt,
                      expectedTarget: drill.pattern,
                      userTranscript: answer,
                      completed: verdict.ok,
                      correction: verdict.recast,
                      flaggedForReview: flagged,
                    });
                  } finally {
                    setBusy(false);
                  }
                  setStep("done");
                }}
              >
                Finish
              </Button>
            </div>
          ) : null}
        </Card>
      </Shell>
    );
  }

  return (
    <Shell step="done">
      <Card>
        <CardHeading>Bridge complete</CardHeading>
        <p data-testid="bridge-recap" className="mb-6 text-2xl font-bold text-brand">
          You turned a phrase you understood into one you can say.
        </p>
        <p className="mb-6 text-base text-brand">
          That&apos;s the whole point — Hear → Repeat → Mod → Mix → Make.
        </p>
        {onComplete ? (
          <Button
            variant="secondary"
            data-testid="bridge-continue"
            onClick={onComplete}
          >
            Continue
          </Button>
        ) : (
          <Link
            href="/"
            data-testid="bridge-back"
            className="text-base font-bold uppercase text-brand underline"
          >
            Back to dashboard
          </Link>
        )}
      </Card>
    </Shell>
  );
}

function Shell({
  step,
  children,
}: {
  step: BridgeStep;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold uppercase text-heading md:text-5xl">
        Bridge Drill
      </h1>
      <p
        data-testid="bridge-step"
        className="mb-8 text-sm font-semibold uppercase text-body-subtle"
      >
        Hear → Repeat → Mod → Mix → Make · {STEP_TITLES[step]}
      </p>
      {children}
    </div>
  );
}
