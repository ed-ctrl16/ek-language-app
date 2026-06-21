/**
 * AI seam. Every Claude call goes through this interface so flows can be
 * exercised offline and deterministically via MockAIClient. The interface
 * starts minimal (one `complete` method) and grows typed methods per iteration
 * (assess, generate, correct) as those features land.
 */
export type AIRole = "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AICompletionRequest {
  system?: string;
  messages: AIMessage[];
  maxTokens?: number;
  /** Optional stable key so mocks/evals can match a request to a fixture. */
  fixtureKey?: string;
}

export interface AICompletionResult {
  text: string;
}

export interface AIClient {
  complete(req: AICompletionRequest): Promise<AICompletionResult>;
}
