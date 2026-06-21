import type { AIClient } from "./AIClient";
import { MockAIClient } from "./MockAIClient";
import { AI_FIXTURES } from "@/lib/testkit/fixtures";
import { isTestMode } from "@/lib/testkit/testMode";

/**
 * Resolve the AI client for the current context. In test mode, returns a
 * fixture-backed mock (no API key, fully deterministic). Otherwise the real
 * Anthropic client is loaded lazily so test/build paths never import the SDK.
 */
export async function getAIClient(): Promise<AIClient> {
  if (isTestMode()) {
    return new MockAIClient(AI_FIXTURES);
  }
  const { AnthropicAIClient } = await import("./AnthropicAIClient");
  return new AnthropicAIClient();
}
