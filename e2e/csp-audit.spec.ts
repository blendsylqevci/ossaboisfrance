import { test, expect, type Page } from "@playwright/test";

/**
 * Captures CSP violations (these events fire even in Report-Only mode) across
 * the key pages. Run against the deployed site:
 *   E2E_BASE_URL=https://www.ossaboisfrance.com npx playwright test csp-audit
 */
type Violation = { directive: string; blockedURI: string };

async function armViolationCollector(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __csp: Violation[] }).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __csp: Violation[] }).__csp.push({
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
      });
    });
  });
}

async function readViolations(page: Page): Promise<Violation[]> {
  return page.evaluate(
    () => (window as unknown as { __csp?: Violation[] }).__csp || []
  );
}

const staticPaths = [
  "/fr",
  "/fr/maisons",
  "/fr/contact",
  "/fr/b2b",
  "/fr/qui-sommes-nous",
  "/fr/realisations",
];

for (const path of staticPaths) {
  test(`no CSP violations: ${path}`, async ({ page }) => {
    await armViolationCollector(page);
    // Avoid networkidle: image-heavy pages stream 4K assets indefinitely.
    // CSP violations surface during the initial resource load anyway.
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const violations = await readViolations(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

test("no CSP violations: house configurator page", async ({ page }) => {
  await armViolationCollector(page);
  await page.goto("/fr/maisons", { waitUntil: "domcontentloaded" });
  await page.locator('a[href*="/fr/maisons/"]').first().click();
  await page.waitForLoadState("load");
  await page.waitForTimeout(3500);
  const violations = await readViolations(page);
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});
