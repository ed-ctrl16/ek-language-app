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

  // Iteration 3 — Bridge Drills.
  "bridge:drill": JSON.stringify({
    pattern: "describing habitual past actions with the imperfect (vivía, iba)",
    level: "B1",
    hear: {
      sentence: "Cuando era niño, vivía en Madrid.",
      translation: "When I was a child, I lived in Madrid.",
    },
    mod: {
      cloze: "Cuando era niño, ___ en Madrid.",
      target: "vivía",
      distractor: "viví",
    },
    make: {
      prompt: "Now tell me where YOU used to live as a child.",
      modelAnswer: "Cuando era niño, vivía en Bristol.",
    },
  }),
  "bridge:make": JSON.stringify({
    ok: true,
    recast: "Cuando era niño, vivía cerca del mar.",
    note: "Nice — imperfect (vivía) is exactly right for a habitual past.",
  }),
};
