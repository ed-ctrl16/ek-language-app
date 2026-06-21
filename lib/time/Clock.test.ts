import { describe, it, expect } from "vitest";
import { FixedClock } from "./Clock";

describe("FixedClock", () => {
  it("returns the start time until advanced", () => {
    const start = new Date("2026-06-21T09:00:00.000Z");
    const clock = new FixedClock(start);
    expect(clock.now().toISOString()).toBe(start.toISOString());
  });

  it("advances by milliseconds", () => {
    const clock = new FixedClock(new Date("2026-06-21T09:00:00.000Z"));
    clock.advance(1000);
    expect(clock.now().toISOString()).toBe("2026-06-21T09:00:01.000Z");
  });

  it("advances by whole days", () => {
    const clock = new FixedClock(new Date("2026-06-21T09:00:00.000Z"));
    clock.advanceDays(3);
    expect(clock.now().toISOString()).toBe("2026-06-24T09:00:00.000Z");
  });

  it("does not leak its internal Date reference", () => {
    const clock = new FixedClock(new Date("2026-06-21T09:00:00.000Z"));
    const a = clock.now();
    a.setFullYear(2000);
    expect(clock.now().getFullYear()).toBe(2026);
  });
});
