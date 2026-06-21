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

  // Iteration 4 — Guided Conversation.
  "conversation:turn": JSON.stringify({
    reply: "Ah, no pasa nada. Entonces os espero un poco más, ¿vale?",
    correction: {
      original: "voy llegar tarde",
      better: "voy a llegar tarde",
      note: "‘ir a + infinitivo’ needs the ‘a’: voy a llegar.",
    },
  }),
  "conversation:summary": JSON.stringify({
    win: true,
    saidWell: "You clearly explained you'd be late and gave a reason — that's the whole job.",
    patternToReview: "running late + reason (voy a llegar tarde porque...)",
  }),

  // Post-MVP — freshly generated warm-up cloze items (variety on repeat sessions).
  "warmup:generate": JSON.stringify({
    items: [
      { prompt: "Normalmente ___ (desayunar) a las ocho.", target: "desayuno", topic: "routine" },
      { prompt: "Anoche ___ (ver) una película muy buena.", target: "vi", topic: "past" },
      { prompt: "Quiero que tú ___ (venir) a la fiesta.", target: "vengas", topic: "wishes" },
      { prompt: "Si llueve mañana, ___ (quedarse, nosotros) en casa.", target: "nos quedamos", topic: "plans" },
      { prompt: "Cuando llegué, ellos ya ___ (irse).", target: "se habían ido", topic: "past" },
    ],
  }),
};
