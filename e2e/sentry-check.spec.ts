import { test, expect } from "@playwright/test";

/**
 * Functional check that the Sentry client is live: triggers an uncaught error
 * and asserts the SDK transmits an envelope to the Sentry ingest endpoint.
 * Run against production: npx playwright test sentry-check
 */
test("Sentry client transmits errors to ingest", async ({ page }) => {
  const sentryRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("sentry.io")) sentryRequests.push(req.url());
  });

  await page.goto("/fr", { waitUntil: "load" });
  // Wait for the dynamic @sentry/nextjs import + init to complete.
  await page.waitForTimeout(4000);

  // Trigger an uncaught error captured by Sentry's global handler.
  await page.evaluate(() => {
    setTimeout(() => {
      throw new Error("sentry-e2e-verification (ignore — deployment check)");
    }, 0);
  });

  await page.waitForTimeout(6000);
  expect(
    sentryRequests.length,
    `expected a request to sentry.io, saw: ${JSON.stringify(sentryRequests)}`
  ).toBeGreaterThan(0);
});
