import { describe, it, expect } from "vitest";
import { MockAIClient } from "@/lib/ai/MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";
import { InMemoryStore } from "@/lib/store/InMemoryStore";
import { freshState } from "@/lib/srs/scheduler";
import { converseTurn, summarizeConversation } from "./converse";
import { selectRecapCorrections } from "./recap";
import type { ConversationTurn, Correction } from "./types";

const ai = new MockAIClient(AI_FIXTURES);
const NOW = new Date("2026-06-21T09:00:00.000Z");

describe("conversation — full flow (mocked AI)", () => {
  it("returns a reply plus a single form-focused correction", async () => {
    const result = await converseTurn(ai, {
      scenario: "Tell your suegra you'll be late.",
      targetPattern: "running late",
      intensity: "standard",
      history: [{ role: "assistant", text: "¿A qué hora llegáis?" }],
      userMessage: "voy llegar tarde",
    });
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.correction?.better).toBe("voy a llegar tarde");
  });

  it("caps recap corrections to the user's intensity", () => {
    const many: Correction[] = Array.from({ length: 6 }, (_, i) => ({
      original: `o${i}`,
      better: `b${i}`,
      note: `n${i}`,
    }));
    expect(selectRecapCorrections(many, "minimal")).toHaveLength(1);
    expect(selectRecapCorrections(many, "standard")).toHaveLength(3);
    expect(selectRecapCorrections(many, "detailed")).toHaveLength(5);
  });

  it("records user turns as attempts and queues the flagged pattern", async () => {
    const store = new InMemoryStore();
    const history: ConversationTurn[] = [
      { role: "assistant", text: "¿A qué hora llegáis?" },
      { role: "user", text: "voy a llegar tarde porque hay tráfico" },
      { role: "assistant", text: "Vale, sin problema." },
      { role: "user", text: "lo siento, llego en veinte minutos" },
    ];

    const summary = await summarizeConversation(ai, {
      scenario: "Tell your suegra you'll be late.",
      targetPattern: "running late",
      history,
    });

    for (const turn of history.filter((t) => t.role === "user")) {
      await store.saveAttempt({
        id: `att-${turn.text.length}`,
        userId: "u1",
        sessionId: null,
        practiceItemId: null,
        promptShown: "Tell your suegra you'll be late.",
        expectedTarget: "running late",
        userTranscript: turn.text,
        latencyMs: null,
        completed: summary.win,
        correction: null,
        shouldReappear: false,
        createdAt: NOW.toISOString(),
      });
    }
    await store.saveItems([
      {
        id: "conv-item-1",
        userId: "u1",
        itemType: "pattern",
        prompt: `Use this again: ${summary.patternToReview}`,
        target: summary.patternToReview,
        topic: "conversation",
        level: "A2",
        recognition: freshState(NOW, false),
        production: freshState(NOW, false),
        source: "from_conversation",
        isSavings: false,
        createdAt: NOW.toISOString(),
      },
    ]);

    expect(await store.listAttempts("u1")).toHaveLength(2);
    const items = await store.listItems("u1");
    expect(items).toHaveLength(1);
    expect(items[0]!.source).toBe("from_conversation");
  });
});
