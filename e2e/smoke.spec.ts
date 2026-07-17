import { test, expect } from "@playwright/test";

test.describe("Critical path smoke", () => {
  test("homepage loads", async ({ page }) => {
    const res = await page.goto("/fr");
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Ossa Bois/i);
  });

  test("homepage serves a responsive hero and defers the comparison image", async ({ page }) => {
    await page.goto("/fr", { waitUntil: "domcontentloaded" });

    const slider = page.locator(".hero-compare-slider");
    const primary = slider.locator(".hero-slider-img").first();
    await expect(primary).toHaveAttribute("sizes", "100vw");
    await expect(primary).toHaveAttribute("srcset", /\/_next\/image\?/);
    await expect(slider.locator(".hero-slider-clip")).toHaveCount(0);

    await slider.focus();
    // DOM content can arrive before React hydration on a cold dev/preview
    // start. Retry the real keyboard interaction until the handler is live.
    await expect
      .poll(async () => {
        await slider.press("ArrowRight");
        return slider.locator(".hero-slider-clip").count();
      })
      .toBe(1);
  });

  test("houses listing loads and shows models", async ({ page }) => {
    const res = await page.goto("/fr/maisons");
    expect(res?.status()).toBeLessThan(400);
    // At least one house link should be present.
    await expect(page.locator('a[href*="/fr/maisons/"]').first()).toBeVisible();
  });

  test("a house page renders the configurator/visual", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/fr/maisons");
    const firstHouse = page.locator('a[href*="/fr/maisons/"]').first();
    const href = await firstHouse.getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!, { waitUntil: "domcontentloaded" });

    const visual = page
      .locator(".house-main-image img, .house-detail-media img")
      .first();
    await expect(visual).toBeVisible();
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
