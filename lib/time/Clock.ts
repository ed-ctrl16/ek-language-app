/**
 * Time seam. Nothing in the app calls `Date.now()` / `new Date()` directly —
 * it takes a Clock, so tests can pin time and SRS scheduling is deterministic.
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedClock implements Clock {
  private current: Date;

  constructor(start: Date) {
    this.current = new Date(start);
  }

  now(): Date {
    return new Date(this.current);
  }

  /** Advance the clock by a number of milliseconds (test helper). */
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }

  /** Advance the clock by whole days (test helper). */
  advanceDays(days: number): void {
    this.advance(days * 24 * 60 * 60 * 1000);
  }
}
