import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Integration tests: whole flows with mocked seams (MockAIClient, TextVoiceClient).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.int.test.ts"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
});
