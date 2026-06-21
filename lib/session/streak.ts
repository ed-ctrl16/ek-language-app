/**
 * Streak measured in DAYS, not minutes (activation-threshold framing, scope §4):
 * one short session a day beats a weekend marathon. Pure — `today` is injected
 * as a YYYY-MM-DD date string so rollover is deterministic in tests.
 */
export interface StreakResult {
  streak: number;
  isNewDay: boolean;
}

function dayNumber(dateOnly: string): number {
  return Math.floor(Date.parse(`${dateOnly}T00:00:00Z`) / 86_400_000);
}

export function computeStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  today: string,
): StreakResult {
  if (!lastActiveDate) return { streak: 1, isNewDay: true };
  const diff = dayNumber(today) - dayNumber(lastActiveDate);
  if (diff <= 0) return { streak: currentStreak, isNewDay: false }; // same day
  if (diff === 1) return { streak: currentStreak + 1, isNewDay: true }; // consecutive
  return { streak: 1, isNewDay: true }; // gap → reset
}
