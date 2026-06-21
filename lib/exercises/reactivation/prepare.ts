import type { AIClient } from "@/lib/ai/AIClient";
import type { CefrLevel } from "@/lib/levels/cefr";
import type { Store } from "@/lib/store";
import type { PracticeItem } from "@/lib/srs/types";
import { freshState } from "@/lib/srs/scheduler";
import { seedItemsForPeak } from "@/lib/srs/seedBank";
import { selectDueWarmup } from "./warmup";

const BLOCK_SIZE = 5;

export interface WarmupBlockItem {
  id: string;
  prompt: string;
  target: string;
  level: string;
}

/**
 * Prepare a warm-up block (server helper, used by the warmup route and the
 * daily session): seed on first ever visit, take due items, and top up with
 * freshly generated cloze items when the due queue runs short — so repeat
 * sessions (even same day) get new content instead of replaying old items.
 */
export async function prepareWarmupItems(
  store: Store,
  ai: AIClient,
  userId: string,
  peakLevel: CefrLevel,
  productiveLevel: CefrLevel,
  now: Date,
): Promise<WarmupBlockItem[]> {
  let items = await store.listItems(userId);
  if (items.length === 0) {
    const seeded = seedItemsForPeak(peakLevel, userId, now);
    await store.saveItems(seeded);
    items = seeded;
  }

  const block: PracticeItem[] = selectDueWarmup(items, now, BLOCK_SIZE);

  if (block.length < BLOCK_SIZE) {
    const { generateWarmupItems } = await import("./generate");
    const drafts = await generateWarmupItems(ai, {
      level: productiveLevel,
      count: BLOCK_SIZE - block.length,
      avoid: items.map((i) => i.prompt).slice(-30),
    });
    const fresh: PracticeItem[] = drafts.map((d) => ({
      id: `gen-${crypto.randomUUID()}`,
      userId,
      itemType: "vocab",
      prompt: d.prompt,
      target: d.target,
      topic: d.topic,
      level: productiveLevel,
      recognition: freshState(now, true),
      production: freshState(now, true),
      source: "generated",
      isSavings: false,
      createdAt: now.toISOString(),
    }));
    await store.saveItems(fresh);
    block.push(...fresh);
  }

  return block.slice(0, BLOCK_SIZE).map((i) => ({
    id: i.id,
    prompt: i.prompt,
    target: i.target,
    level: i.level,
  }));
}
