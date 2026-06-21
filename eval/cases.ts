import type { AICompletionRequest } from "../lib/ai/AIClient";

/**
 * Prompt eval cases. Each case sends a request through an AIClient and asserts
 * a property of the response. Iteration 0 ships one smoke case proving the
 * harness runs end to end (against MockAIClient). Real pedagogy fixtures
 * (Returner correction style, level calibration, stuck-user, overcorrection,
 * mixed-language) arrive with the iterations that introduce those prompts.
 */
export interface EvalCase {
  name: string;
  request: AICompletionRequest;
  /** Return null on pass, or a failure message on fail. */
  check: (text: string) => string | null;
}

export const EVAL_CASES: EvalCase[] = [
  {
    name: "smoke: mock resolves a fixture",
    request: {
      fixtureKey: "smoke:hello",
      messages: [{ role: "user", content: "hola" }],
    },
    check: (text) =>
      text.toLowerCase().includes("hola")
        ? null
        : `expected greeting to contain "hola", got: ${text}`,
  },
];
