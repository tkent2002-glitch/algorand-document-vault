import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "artifactSmoke.spec.ts",
  globalSetup: "./tests/e2e/artifactGlobalSetup.ts",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4190",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "artifact-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
