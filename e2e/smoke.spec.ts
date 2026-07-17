import { test, expect } from "@playwright/test";

test.describe("Critical path smoke", () => {
  test("homepage loads", async ({ page }) => {
    const res = await page.goto("/fr");
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Ossa Bois/i);
  });

  test("homepage rotates a responsive hero and keeps the comparison toggle", async ({ page }) => {
    await page.goto("/fr", { waitUntil: "domcontentloaded" });

    const slider = page.locator(".hero-compare-slider");
    const primary = slider.locator(".hero-slider-img").first();
    const secondary = slider.locator(".hero-slider-img").nth(1);
    const firstHouseSlug = await slider.getAttribute("data-house-slug");
    const nextHouseSlug = await slider.getAttribute("data-next-house-slug");

    expect(firstHouseSlug).toBeTruthy();
    expect(nextHouseSlug).toBeTruthy();
    expect(nextHouseSlug).not.toBe(firstHouseSlug);
    await expect(slider.locator(".hero-slider-img")).toHaveCount(2);
    await expect(primary).toHaveAttribute("sizes", "100vw");
    await expect(primary).toHaveAttribute("srcset", /\/_next\/image\?/);
    await expect(secondary).toHaveAttribute("sizes", "100vw");
    await expect(secondary).toHaveAttribute("srcset", /\/_next\/image\?/);
    await expect(slider.locator(".hero-slider-divider")).toBeVisible();
    await expect(slider.locator(".hero-slider-divider")).toHaveAttribute(
      "style",
      /left:\s*50%/
    );

    await expect(slider).toHaveAttribute("aria-busy", "false");
    await expect
      .poll(() =>
        slider.locator(".hero-slider-img").evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0
          )
        )
      )
      .toBe(true);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".hero-compare-slider")).toHaveAttribute(
      "data-house-slug",
      nextHouseSlug!
    );

    const refreshedSlider = page.locator(".hero-compare-slider");
    await refreshedSlider.focus();
    await expect
      .poll(async () => {
        await refreshedSlider.press("ArrowRight");
        return Number(await refreshedSlider.getAttribute("aria-valuenow"));
      })
      .toBeGreaterThan(50);
  });

  test("houses listing loads and shows models", async ({ page }) => {
    const res = await page.goto("/fr/maisons");
    expect(res?.status()).toBeLessThan(400);
    // At least one house link should be present.
    await expect(page.locator('a[href*="/fr/maisons/"]').first()).toBeVisible();
  });

  test("house cards load the Enduit/Bardage comparison at 50/50", async ({ page }) => {
    await page.goto("/fr/maisons", { waitUntil: "domcontentloaded" });

    const slider = page.locator(".house-archive-card .compare-slider").first();
    await slider.scrollIntoViewIfNeeded();
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("aria-valuenow", "50");

    const enduit = slider.locator('img[alt$="Enduit"]');
    const bardage = slider.locator('img[alt$="Bardage"]');
    await expect(enduit).toHaveCount(1);
    await expect(bardage).toHaveCount(1);
    await expect(slider.locator(".compare-clip")).toHaveAttribute(
      "style",
      /inset\(0(?:px)? 50% 0(?:px)? 0(?:px)?\)/
    );
    await expect(enduit).toHaveAttribute("loading", "lazy");

    const enduitSrc = await enduit.getAttribute("src");
    const bardageSrc = await bardage.getAttribute("src");
    expect(enduitSrc).toBeTruthy();
    expect(bardageSrc).toBeTruthy();
    expect(enduitSrc).not.toBe(bardageSrc);
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
