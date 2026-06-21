import Anthropic from "@anthropic-ai/sdk";
import type {
  AIClient,
  AICompletionRequest,
  AICompletionResult,
} from "./AIClient";

/**
 * Real AI client. Server-only — never import from a client component
 * (it reads ANTHROPIC_API_KEY and talks to the Anthropic API).
 *
 * Model choice per the `claude-api` skill: default to the latest capable
 * Claude model (`claude-opus-4-8`) with adaptive thinking. Revisit per-call
 * model selection as iterations add cheaper deterministic paths.
 */
const DEFAULT_MODEL = "claude-opus-4-8";

export class AnthropicAIClient implements AIClient {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    // No-arg construction resolves ANTHROPIC_API_KEY from the environment.
    this.client = new Anthropic(
      opts.apiKey ? { apiKey: opts.apiKey } : undefined,
    );
    this.model = opts.model ?? DEFAULT_MODEL;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      thinking: { type: "adaptive" },
      ...(req.system ? { system: req.system } : {}),
      messages: req.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return { text };
  }
}
