import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: "artifactSmoke.spec.ts",
  globalSetup: "./tests/e2e/globalSetup.ts",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4180",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "stable-chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
