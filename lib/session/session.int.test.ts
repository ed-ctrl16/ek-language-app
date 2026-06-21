import { describe, it, expect } from "vitest";
import { InMemoryStore } from "@/lib/store/InMemoryStore";
import type { HablaUser } from "@/lib/store/Store";
import { SeededRandom } from "@/lib/random/Random";
import { EXERCISES } from "./registry";
import { planDailySession } from "./orchestrator";
import { computeStreak } from "./streak";

function makeUser(): HablaUser {
  return {
    id: "u1",
    pathway: "returner",
    receptiveLevel: "B2",
    productiveLevel: "A2",
    confidence: "medium",
    peakLevel: "B2",
    yearsSinceActiveUse: 8,
    readsSpanish: false,
    goals: [],
    topics: [],
    correctionIntensity: "standard",
    streakCount: 0,
    lastActiveDate: null,
    createdAt: "2026-06-21T09:00:00.000Z",
  };
}

// Mirrors completeSessionAction against the store seam (the action is covered
// end-to-end by the session e2e).
async function completeSession(
  store: InMemoryStore,
  userId: string,
  blocks: string[],
  today: string,
): Promise<number> {
  const user = (await store.getUser(userId))!;
  const { streak } = computeStreak(user.lastActiveDate, user.streakCount, today);
  await store.saveUser({ ...user, streakCount: streak, lastActiveDate: today });
  await store.saveSession({
    id: `s-${today}`,
    userId,
    exerciseBlocks: blocks,
    durationSeconds: null,
    completed: true,
    createdAt: `${today}T18:00:00.000Z`,
  });
  return streak;
}

describe("daily session", () => {
  it("plans an interleaved, budgeted set of blocks", () => {
    const plan = planDailySession(EXERCISES, 18, new SeededRandom(1));
    expect(plan.blocks).toHaveLength(3);
    const ids = plan.blocks.map((b) => b.id);
    expect(ids.every((id, i) => i === 0 || id !== ids[i - 1])).toBe(true);
  });

  it("records a session and rolls the streak across consecutive days", async () => {
    const store = new InMemoryStore();
    await store.saveUser(makeUser());

    expect(await completeSession(store, "u1", ["reactivation", "bridge"], "2026-06-21")).toBe(1);
    expect(await completeSession(store, "u1", ["reactivation", "bridge"], "2026-06-22")).toBe(2);

    expect(await store.listSessions("u1")).toHaveLength(2);
    const user = (await store.getUser("u1"))!;
    expect(user.streakCount).toBe(2);
    expect(user.lastActiveDate).toBe("2026-06-22");
  });

  it("does not double-count two sessions on the same day", async () => {
    const store = new InMemoryStore();
    await store.saveUser(makeUser());
    await completeSession(store, "u1", ["bridge"], "2026-06-21");
    const second = await completeSession(store, "u1", ["conversation"], "2026-06-21");
    expect(second).toBe(1);
    expect((await store.getUser("u1"))!.streakCount).toBe(1);
  });
});
