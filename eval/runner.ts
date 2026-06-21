import { MockAIClient } from "../lib/ai/MockAIClient";
import { AI_FIXTURES } from "../lib/testkit/fixtures";
import { EVAL_CASES } from "./cases";

/**
 * Prompt eval runner: `npm run eval`. Runs each case against the
 * fixture-backed MockAIClient (offline, deterministic) and reports pass/fail.
 * A prompt change should be accompanied by an eval run.
 */
async function main(): Promise<void> {
  const ai = new MockAIClient(AI_FIXTURES);
  let failures = 0;

  for (const c of EVAL_CASES) {
    try {
      const { text } = await ai.complete(c.request);
      const failure = c.check(text);
      if (failure) {
        failures++;
        console.error(`✗ ${c.name}\n  ${failure}`);
      } else {
        console.log(`✓ ${c.name}`);
      }
    } catch (err) {
      failures++;
      console.error(`✗ ${c.name}\n  threw: ${(err as Error).message}`);
    }
  }

  console.log(`\n${EVAL_CASES.length - failures}/${EVAL_CASES.length} passed`);
  if (failures > 0) process.exit(1);
}

main();
