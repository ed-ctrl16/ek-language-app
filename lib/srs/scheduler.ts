import type { SrsState } from "./types";

/**
 * Spaced-repetition scheduling. Pure — every function takes `now: Date` rather
 * than reading the clock, so intervals are deterministic in tests. Expanding
 * intervals per the science (Ebbinghaus / expanding retrieval): a correct
 * review advances one step; a miss resets to day 1.
 */
export const INTERVALS_DAYS = [1, 3, 7, 14, 30, 90] as const;

/** Returner "I already know this" lands here — past day-1, straight to day-7. */
export const SAVINGS_INTERVAL_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(now: Date, days: number): Date {
  return new Date(now.getTime() + days * MS_PER_DAY);
}

function nextIntervalAfter(current: number): number {
  const i = INTERVALS_DAYS.indexOf(current as (typeof INTERVALS_DAYS)[number]);
  if (i < 0) return INTERVALS_DAYS[0];
  return INTERVALS_DAYS[Math.min(i + 1, INTERVALS_DAYS.length - 1)]!;
}

/** A new item. `dueNow` makes it appear in today's queue immediately (seeding). */
export function freshState(now: Date, dueNow = true): SrsState {
  return {
    intervalDays: INTERVALS_DAYS[0],
    streak: 0,
    nextDue: (dueNow ? now : addDays(now, INTERVALS_DAYS[0])).toISOString(),
  };
}

/** Advance on a correct review; reset to day-1 on a miss. */
export function reviewState(
  state: SrsState,
  correct: boolean,
  now: Date,
): SrsState {
  if (!correct) {
    return {
      intervalDays: INTERVALS_DAYS[0],
      streak: 0,
      nextDue: addDays(now, INTERVALS_DAYS[0]).toISOString(),
    };
  }
  const next = nextIntervalAfter(state.intervalDays);
  return {
    intervalDays: next,
    streak: state.streak + 1,
    nextDue: addDays(now, next).toISOString(),
  };
}

/** Returner savings shortcut: skip day-1, schedule directly at day-7. */
export function markKnownState(now: Date): SrsState {
  return {
    intervalDays: SAVINGS_INTERVAL_DAYS,
    streak: 1,
    nextDue: addDays(now, SAVINGS_INTERVAL_DAYS).toISOString(),
  };
}

export function isDue(state: SrsState, now: Date): boolean {
  return state.nextDue !== null && Date.parse(state.nextDue) <= now.getTime();
}
