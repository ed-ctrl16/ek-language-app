/**
 * Canned AI responses for MockAIClient, keyed by `fixtureKey` or by the exact
 * last user-message text. Grows per iteration as flows add Claude calls.
 */
export const AI_FIXTURES: Record<string, string> = {
  "smoke:hello": "¡Hola! Listo para practicar.",
};
