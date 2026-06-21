"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeading } from "@/components/ui/Card";
import { WarmupExercise, type WarmupItem } from "@/app/warmup/WarmupExercise";
import { BridgeDrillExercise } from "@/app/bridge/BridgeDrillExercise";
import { ConversationMissionUI } from "@/app/conversation/ConversationMissionUI";
import type { ExerciseId } from "@/lib/session/registry";
import type { BridgeDrill } from "@/lib/exercises/bridge/types";
import type { MixStep } from "@/lib/exercises/bridge/mix";
import type { ConversationMission } from "@/lib/exercises/conversation/types";
import { completeSessionAction } from "./actions";

export interface SessionBlock {
  id: ExerciseId;
  label: string;
}

export interface SessionData {
  blocks: SessionBlock[];
  warmupItems: WarmupItem[];
  bridgeDrill: BridgeDrill;
  bridgeMix: MixStep;
  mission: ConversationMission;
}

/**
 * The daily session: runs each planned exercise block in sequence (the standalone
 * exercise components, driven via onComplete), then a session recap with the
 * day-streak. Interleaving + selection happened in the orchestrator (server).
 */
export function SessionPlayer({ data }: { data: SessionData }) {
  const [index, setIndex] = React.useState(0);
  const [streak, setStreak] = React.useState<number | null>(null);
  const done = index >= data.blocks.length;

  async function advance() {
    if (index + 1 < data.blocks.length) {
      setIndex(index + 1);
    } else {
      setIndex(data.blocks.length); // → done
      const result = await completeSessionAction({
        blocks: data.blocks.map((b) => b.id),
      });
      setStreak(result.streak);
    }
  }

  if (done) {
    return (
      <Shell index={data.blocks.length} total={data.blocks.length}>
        <Card>
          <CardHeading>Session complete</CardHeading>
          <p data-testid="session-recap" className="mb-4 text-2xl font-bold text-brand">
            That&apos;s today done — {data.blocks.length} exercises in one short
            sitting.
          </p>
          {streak !== null ? (
            <p className="mb-6 text-lg text-brand">
              🔥 <strong data-testid="session-streak">{streak}</strong> day
              {streak === 1 ? "" : "s"} in a row. Short and often is what moves
              the gap.
            </p>
          ) : null}
          <Link
            href="/"
            className="text-base font-bold uppercase text-brand underline"
          >
            Back to dashboard
          </Link>
        </Card>
      </Shell>
    );
  }

  const block = data.blocks[index]!;

  return (
    <Shell index={index} total={data.blocks.length} label={block.label}>
      {block.id === "reactivation" ? (
        <WarmupExercise items={data.warmupItems} onComplete={advance} />
      ) : block.id === "bridge" ? (
        <BridgeDrillExercise
          drill={data.bridgeDrill}
          mix={data.bridgeMix}
          onComplete={advance}
        />
      ) : (
        <ConversationMissionUI mission={data.mission} onComplete={advance} />
      )}
    </Shell>
  );
}

function Shell({
  index,
  total,
  label,
  children,
}: {
  index: number;
  total: number;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mx-auto max-w-[1000px] px-4 pt-8">
        <p
          data-testid="session-progress"
          className="text-sm font-semibold uppercase text-heading"
        >
          Today&apos;s session · Block {Math.min(index + 1, total)} of {total}
          {label ? ` · ${label}` : ""}
        </p>
      </div>
      {children}
    </div>
  );
}
