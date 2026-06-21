"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { isConversationOver } from "@/lib/exercises/conversation/recap";
import type {
  ConversationMission,
  ConversationRecap,
  ConversationTurn,
  Correction,
} from "@/lib/exercises/conversation/types";
import { converseTurnAction, finishConversationAction } from "./actions";

export function ConversationMissionUI({
  mission,
}: {
  mission: ConversationMission;
}) {
  const [turns, setTurns] = React.useState<ConversationTurn[]>([
    { role: "assistant", text: mission.opener },
  ]);
  const [input, setInput] = React.useState("");
  const [corrections, setCorrections] = React.useState<Correction[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [recap, setRecap] = React.useState<ConversationRecap | null>(null);

  const userTurns = turns.filter((t) => t.role === "user").length;
  const atCap = isConversationOver(userTurns, mission.maxTurns);

  async function send() {
    const userMessage = input.trim();
    if (!userMessage) return;
    const history = turns;
    setTurns((t) => [...t, { role: "user", text: userMessage }]);
    setInput("");
    setBusy(true);
    try {
      const result = await converseTurnAction({
        scenario: mission.scenario,
        targetPattern: mission.targetPattern,
        history,
        userMessage,
      });
      setTurns((t) => [...t, { role: "assistant", text: result.reply }]);
      if (result.correction) setCorrections((c) => [...c, result.correction!]);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      setRecap(
        await finishConversationAction({
          scenario: mission.scenario,
          targetPattern: mission.targetPattern,
          history: turns,
          corrections,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  if (recap) {
    return (
      <Shell scenario={mission.scenario}>
        <Card>
          <CardHeading>{recap.win ? "Mission complete" : "Good effort"}</CardHeading>
          <p
            data-testid="conv-saidwell"
            className="mb-6 rounded border-4 border-ink bg-brand-soft px-5 py-4 text-lg text-brand"
          >
            <strong>You said it well:</strong> {recap.saidWell}
          </p>

          {recap.corrections.length > 0 ? (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase text-brand">
                A few things to tighten
              </p>
              <ul className="flex flex-col gap-2">
                {recap.corrections.map((c, i) => (
                  <li key={i} className="text-base text-brand">
                    <span className="line-through opacity-60">{c.original}</span>{" "}
                    → <strong>{c.better}</strong>{" "}
                    <span className="opacity-70">({c.note})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mb-6 text-base text-brand">
            <strong>Tomorrow:</strong> {recap.patternToReview} — added to your
            queue.
          </p>
          <Link
            href="/"
            data-testid="conv-recap"
            className="text-base font-bold uppercase text-brand underline"
          >
            Back to dashboard
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell scenario={mission.scenario}>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeading>Conversation</CardHeading>
          <div data-testid="conv-messages" className="mb-6 flex flex-col gap-3">
            {turns.map((t, i) => (
              <div
                key={i}
                className={
                  "max-w-[85%] rounded border-4 border-ink px-4 py-3 text-lg " +
                  (t.role === "assistant"
                    ? "self-start bg-brand-soft text-brand"
                    : "self-end bg-brand text-brand-secondary")
                }
              >
                {t.text}
              </div>
            ))}
          </div>

          {!atCap ? (
            <>
              <VoiceTextInput
                id="conv-input"
                label="Your reply (Spanish — or a mix if you're stuck)"
                helper="Speak or type. Keep the conversation going toward the goal."
                value={input}
                onChange={setInput}
              />
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="secondary"
                  data-testid="conv-send"
                  disabled={busy || input.trim().length === 0}
                  onClick={send}
                >
                  {busy ? "…" : "Send"}
                </Button>
                {userTurns >= 1 ? (
                  <Button
                    variant="tertiary"
                    data-testid="conv-finish"
                    disabled={busy}
                    onClick={finish}
                  >
                    End & see recap
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <Button
              variant="secondary"
              data-testid="conv-finish"
              disabled={busy}
              onClick={finish}
            >
              {busy ? "…" : "See your recap"}
            </Button>
          )}
        </Card>

        {/* Live corrections — collected quietly, never interrupting the flow. */}
        <Card>
          <CardHeading>Notes</CardHeading>
          {corrections.length === 0 ? (
            <p className="text-base text-brand opacity-70">
              Tips will appear here as you speak — they won&apos;t interrupt.
            </p>
          ) : (
            <ul data-testid="conv-corrections" className="flex flex-col gap-3">
              {corrections.map((c, i) => (
                <li key={i} className="text-base text-brand">
                  <strong>{c.better}</strong>
                  <span className="block text-sm opacity-70">{c.note}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Shell>
  );
}

function Shell({
  scenario,
  children,
}: {
  scenario: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[1000px] px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold uppercase text-heading md:text-5xl">
        Conversation Mission
      </h1>
      <p className="mb-8 text-lg text-body">
        <strong>Your goal:</strong> {scenario}
      </p>
      {children}
    </div>
  );
}
