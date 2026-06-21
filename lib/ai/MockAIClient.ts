import type {
  AIClient,
  AICompletionRequest,
  AICompletionResult,
} from "./AIClient";

/**
 * Fixture-backed AI double. Resolves a response by `fixtureKey` first, then by
 * the last user message text. Throws on a miss so tests fail loudly rather than
 * silently passing on an unstubbed prompt.
 */
export class MockAIClient implements AIClient {
  constructor(private readonly fixtures: Record<string, string>) {}

  async complete(req: AICompletionRequest): Promise<AICompletionResult> {
    const byKey = req.fixtureKey ? this.fixtures[req.fixtureKey] : undefined;
    if (byKey !== undefined) return { text: byKey };

    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const byMessage = lastUser ? this.fixtures[lastUser.content] : undefined;
    if (byMessage !== undefined) return { text: byMessage };

    throw new Error(
      `MockAIClient: no fixture for key="${req.fixtureKey ?? ""}" / message="${
        lastUser?.content ?? ""
      }". Add it to lib/testkit/fixtures.ts.`,
    );
  }
}
