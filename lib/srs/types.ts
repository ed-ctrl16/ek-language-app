import type { CefrLevel } from "@/lib/levels/cefr";

/**
 * One side of an SRS item's schedule. Items track recognition and production
 * separately (an Absorber pattern, but useful for Returners too): you can know
 * a word on sight long before you can produce it under pressure.
 */
export interface SrsState {
  intervalDays: number;
  streak: number;
  /** ISO timestamp the item is next due, or null if unscheduled. */
  nextDue: string | null;
}

export type PracticeItemType = "vocab" | "pattern" | "move";
export type PracticeItemSource = "seeded" | "generated" | "from_conversation";

export interface PracticeItem {
  id: string;
  userId: string;
  itemType: PracticeItemType;
  /** Cloze sentence with a blank, e.g. "Ayer ___ al cine." */
  prompt: string;
  /** The word/phrase that fills the blank, e.g. "fui". */
  target: string;
  topic: string;
  level: CefrLevel;
  recognition: SrsState;
  production: SrsState;
  source: PracticeItemSource;
  /** Returner "I already know this" was used on this item. */
  isSavings: boolean;
  createdAt: string;
}
