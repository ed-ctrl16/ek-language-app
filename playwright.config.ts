import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// E2E runs against the real UI in deterministic test mode (HABLA_TEST_MODE=1),
// driving every "spoken" turn through the text-fallback path — no microphone.
export default defineConfig({
  testDir: "./e2e",
  // One dev server compiles routes lazily; parallel workers thrash it and cause
  // flaky first-hit timeouts. Run serially for deterministic results.
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "./e2e/.results",
  // Next dev compiles routes (and server actions) lazily on first hit, which can
  // take several seconds cold — generous timeouts keep that from flaking.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      HABLA_TEST_MODE: "1",
    },
  },
});
