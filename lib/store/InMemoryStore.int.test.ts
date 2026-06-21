import { describe, it, expect } from "vitest";
import { InMemoryStore } from "./InMemoryStore";
import type { HablaUser } from "./Store";

const USER: HablaUser = {
  id: "u1",
  pathway: "returner",
  receptiveLevel: "B2",
  productiveLevel: "A2",
  confidence: "medium",
  peakLevel: "B2",
  yearsSinceActiveUse: 8,
  readsSpanish: false,
  goals: ["travel"],
  topics: ["food"],
  correctionIntensity: "standard",
  streakCount: 0,
  createdAt: "2026-06-21T09:00:00.000Z",
};

describe("InMemoryStore", () => {
  it("round-trips a user", async () => {
    const store = new InMemoryStore();
    await store.saveUser(USER);
    expect(await store.getUser("u1")).toEqual(USER);
  });

  it("returns null for an unknown user", async () => {
    const store = new InMemoryStore();
    expect(await store.getUser("nope")).toBeNull();
  });

  it("lists a user's assessments in chronological order", async () => {
    const store = new InMemoryStore();
    await store.saveAssessment({
      id: "a2",
      userId: "u1",
      receptive: "B2",
      productive: "B1",
      confidence: "medium",
      gaps: [],
      createdAt: "2026-06-23T09:00:00.000Z",
    });
    await store.saveAssessment({
      id: "a1",
      userId: "u1",
      receptive: "B2",
      productive: "A2",
      confidence: "medium",
      gaps: [],
      createdAt: "2026-06-21T09:00:00.000Z",
    });
    const list = await store.listAssessments("u1");
    expect(list.map((a) => a.id)).toEqual(["a1", "a2"]);
  });
});
