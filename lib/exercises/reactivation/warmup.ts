import { isDue } from "@/lib/srs/scheduler";
import type { PracticeItem } from "@/lib/srs/types";

/**
 * Build a warm-up block: prefer items whose production is due now (most recently
 * due first); if nothing is due, fall back to the earliest-scheduled items so a
 * session is never empty. Pure — `now` is injected for deterministic tests.
 */
export function buildWarmupBlock(
  items: PracticeItem[],
  now: Date,
  size = 5,
): PracticeItem[] {
  const byDue = (a: PracticeItem, b: PracticeItem) =>
    Date.parse(a.production.nextDue ?? "0") -
    Date.parse(b.production.nextDue ?? "0");

  const due = items.filter((i) => isDue(i.production, now)).sort(byDue);
  const pool = due.length > 0 ? due : [...items].sort(byDue);
  return pool.slice(0, size);
}
