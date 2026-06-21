import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// E2E runs against the real UI in deterministic test mode (HABLA_TEST_MODE=1),
// driving every "spoken" turn through the text-fallback path — no microphone.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  outputDir: "./e2e/.results",
  use: {
    baseURL: `http://localhost:${PORT}`,
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
