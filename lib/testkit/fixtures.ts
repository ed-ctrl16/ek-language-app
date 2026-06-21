/**
 * Canned AI responses for MockAIClient, keyed by `fixtureKey` or by the exact
 * last user-message text. Grows per iteration as flows add Claude calls.
 */
export const AI_FIXTURES: Record<string, string> = {
  "smoke:hello": "¡Hola! Listo para practicar.",

  // Iteration 1 — onboarding (deterministic Returner estimate + warm first win).
  "assess:returner": JSON.stringify({
    receptive: "B2",
    productive: "A2",
    confidence: "medium",
    gaps: ["past tenses under pressure", "speaking speed"],
  }),
  "firstwin:reply":
    "¡Qué bien! Se nota que el español sigue ahí. Vamos a despertarlo poco a poco.",
};
