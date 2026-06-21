/**
 * Deterministic test mode. When on, the app wires up MockAIClient,
 * TextVoiceClient, a fixed clock, a seeded RNG, and the seeded Returner
 * profile — so any run is reproducible. Playwright sets HABLA_TEST_MODE=1.
 */
export const TEST_SEED = 1_234_567;

/** Fixed "now" for deterministic clock-dependent logic in tests. */
export const TEST_NOW = new Date("2026-06-21T09:00:00.000Z");

export function isTestMode(): boolean {
  return process.env.HABLA_TEST_MODE === "1";
}
