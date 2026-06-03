import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests run against a deployed URL (no local DB needed).
 * Override the target with E2E_BASE_URL, e.g.:
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 * First run requires browser binaries: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "https://www.ossaboisfrance.com",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
