import { test, expect } from "@playwright/test";

test.describe("Critical path smoke", () => {
  test("homepage loads", async ({ page }) => {
    const res = await page.goto("/fr");
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Ossa Bois/i);
  });

  test("houses listing loads and shows models", async ({ page }) => {
    const res = await page.goto("/fr/maisons");
    expect(res?.status()).toBeLessThan(400);
    // At least one house link should be present.
    await expect(page.locator('a[href*="/fr/maisons/"]').first()).toBeVisible();
  });

  test("a house page renders the configurator/visual", async ({ page }) => {
    await page.goto("/fr/maisons");
    const firstHouse = page.locator('a[href*="/fr/maisons/"]').first();
    await firstHouse.click();
    await page.waitForLoadState("domcontentloaded");
    // House media should be present (served via Payload /api/media/file).
    await expect(page.locator('img[src*="/api/media/file"]').first()).toBeVisible();
  });

  test("contact page exposes a working form", async ({ page }) => {
    const res = await page.goto("/fr/contact");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/fr");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBeTruthy();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age");
  });
});
