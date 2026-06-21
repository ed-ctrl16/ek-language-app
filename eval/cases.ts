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
  {
    name: "assess: returner estimate is valid JSON with a positive gap",
    request: {
      fixtureKey: "assess:returner",
      messages: [{ role: "user", content: "diagnostic answers..." }],
    },
    check: (text) => {
      let parsed: { receptive?: string; productive?: string };
      try {
        parsed = JSON.parse(text);
      } catch {
        return `expected JSON, got: ${text}`;
      }
      const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const r = order.indexOf(parsed.receptive ?? "");
      const p = order.indexOf(parsed.productive ?? "");
      if (r < 0 || p < 0) return `invalid levels: ${text}`;
      return r >= p ? null : `expected receptive >= productive, got ${text}`;
    },
  },
  {
    name: "first win: reply is warm and encouraging",
    request: {
      fixtureKey: "firstwin:reply",
      messages: [{ role: "user", content: "Aprendí en la universidad." }],
    },
    check: (text) =>
      /bien|¡|genial|vamos/i.test(text)
        ? null
        : `expected an encouraging Spanish reply, got: ${text}`,
  },
  {
    name: "bridge make: returns a recast and a single short note",
    request: {
      fixtureKey: "bridge:make",
      messages: [{ role: "user", content: "Cuando era niño vivia cerca del mar" }],
    },
    check: (text) => {
      let parsed: { ok?: boolean; recast?: string; note?: string };
      try {
        parsed = JSON.parse(text);
      } catch {
        return `expected JSON, got: ${text}`;
      }
      if (typeof parsed.ok !== "boolean") return "missing ok";
      if (!parsed.recast) return "missing recast";
      if (!parsed.note) return "missing note";
      // Overcorrection guard: a single, brief note — not a feed of fixes.
      const sentences = parsed.note.split(/[.!?]+/).filter((s) => s.trim());
      return sentences.length <= 2
        ? null
        : `note looks like overcorrection (${sentences.length} sentences): ${parsed.note}`;
    },
  },
];
