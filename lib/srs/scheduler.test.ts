import { describe, it, expect } from "vitest";
import {
  INTERVALS_DAYS,
  SAVINGS_INTERVAL_DAYS,
  freshState,
  isDue,
  markKnownState,
  reviewState,
} from "./scheduler";
import type { SrsState } from "./types";

const NOW = new Date("2026-06-21T09:00:00.000Z");
const dayMs = 24 * 60 * 60 * 1000;

function daysBetween(fromIso: string | null, now: Date): number {
  return Math.round((Date.parse(fromIso!) - now.getTime()) / dayMs);
}

describe("freshState", () => {
  it("starts at interval 1 with streak 0", () => {
    const s = freshState(NOW);
    expect(s.intervalDays).toBe(1);
    expect(s.streak).toBe(0);
  });

  it("is due now when seeded with dueNow", () => {
    expect(isDue(freshState(NOW, true), NOW)).toBe(true);
  });

  it("is not due yet when seeded with dueNow=false", () => {
    expect(isDue(freshState(NOW, false), NOW)).toBe(false);
  });
});

describe("reviewState", () => {
  it("advances through the expanding intervals on repeated correct reviews", () => {
    let s = freshState(NOW);
    const seen: number[] = [];
    for (let i = 0; i < INTERVALS_DAYS.length + 1; i++) {
      s = reviewState(s, true, NOW);
      seen.push(s.intervalDays);
    }
    // 1 → 3 → 7 → 14 → 30 → 90 → 90 (caps at the max)
    expect(seen).toEqual([3, 7, 14, 30, 90, 90, 90]);
  });

  it("increments streak on correct reviews", () => {
    let s = freshState(NOW);
    s = reviewState(s, true, NOW);
    s = reviewState(s, true, NOW);
    expect(s.streak).toBe(2);
  });

  it("resets to day-1 and streak 0 on a miss", () => {
    let s = freshState(NOW);
    s = reviewState(s, true, NOW); // now at 3
    s = reviewState(s, true, NOW); // now at 7
    s = reviewState(s, false, NOW);
    expect(s.intervalDays).toBe(1);
    expect(s.streak).toBe(0);
    expect(daysBetween(s.nextDue, NOW)).toBe(1);
  });

  it("schedules nextDue the interval number of days out", () => {
    const s = reviewState(freshState(NOW), true, NOW); // interval 3
    expect(daysBetween(s.nextDue, NOW)).toBe(3);
  });
});

describe("markKnownState (savings shortcut)", () => {
  it("jumps straight to day-7, skipping day-1", () => {
    const s = markKnownState(NOW);
    expect(s.intervalDays).toBe(SAVINGS_INTERVAL_DAYS);
    expect(daysBetween(s.nextDue, NOW)).toBe(7);
  });
});

describe("isDue", () => {
  it("is true once nextDue is reached", () => {
    const state: SrsState = {
      intervalDays: 3,
      streak: 1,
      nextDue: NOW.toISOString(),
    };
    expect(isDue(state, NOW)).toBe(true);
    expect(isDue(state, new Date(NOW.getTime() - 1000))).toBe(false);
  });

  it("is false for an unscheduled item", () => {
    expect(isDue({ intervalDays: 1, streak: 0, nextDue: null }, NOW)).toBe(false);
  });
});
