import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests: pure logic only. Excludes integration (*.int.test.ts) and e2e.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["**/*.int.test.ts", "e2e/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
});
