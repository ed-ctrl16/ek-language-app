import { describe, it, expect } from "vitest";
import { MockAIClient } from "./MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";

// Integration: the AI seam resolves through the mock without network/keys.
describe("MockAIClient (seam)", () => {
  it("resolves a response by fixtureKey", async () => {
    const ai = new MockAIClient(AI_FIXTURES);
    const { text } = await ai.complete({
      fixtureKey: "smoke:hello",
      messages: [{ role: "user", content: "anything" }],
    });
    expect(text.toLowerCase()).toContain("hola");
  });

  it("resolves a response by last user message", async () => {
    const ai = new MockAIClient({ "ping": "pong" });
    const { text } = await ai.complete({
      messages: [{ role: "user", content: "ping" }],
    });
    expect(text).toBe("pong");
  });

  it("throws loudly on an unstubbed prompt", async () => {
    const ai = new MockAIClient({});
    await expect(
      ai.complete({ messages: [{ role: "user", content: "unknown" }] }),
    ).rejects.toThrow(/no fixture/i);
  });
});
