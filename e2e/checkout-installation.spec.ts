import { expect, test, type Page } from "@playwright/test";

const configurationOnlySelection = {
  house: {
    id: "regence",
    name: "Regence",
    image: "/images/houses/7 ambre.jpg",
  },
  size: {
    value: "60x160",
    label: "60x160",
    price: "13000",
    image: "/images/houses/7 ambre.jpg",
  },
  currentImage: "/images/houses/7 ambre.jpg",
  isolation: {
    value: "laine-de-verre",
    label: "Laine de verre",
    price: "0",
  },
  selectedOptions: [
    {
      categoryId: "isolation",
      categoryLabel: "Isolation",
      optionId: "laine-de-verre",
      label: "Laine de verre",
    },
  ],
  configurationSubtotal: 13_000,
  totalPrice: 13_000,
  priceBasis: "excl_vat",
  vatIncluded: false,
  priceBreakdown: [{ label: "Structure 60x160", value: 13_000 }],
  perdhesa: { bruto: 100, neto: 90 },
};

type SubmittedCheckoutBody = {
  orderRef: string;
  selection: {
    installationMode?: string;
    transportCost?: number;
    assemblyCost?: number;
  };
  total: number;
};

async function seedCheckout(
  page: Page,
  selection: Record<string, unknown> = configurationOnlySelection
) {
  await page.addInitScript((selection) => {
    window.sessionStorage.setItem("house_selections", JSON.stringify(selection));
  }, selection);
}

async function completeCheckoutForm(page: Page) {
  await page.locator('[name="full_name"]').fill("Jean Dupont");
  await page.locator('[name="email"]').fill("jean.dupont@example.com");
  await page.locator('[name="phone"]').fill("+33 6 12 34 56 78");
  await page.locator('[name="street_address"]').fill("Rue");
  await page.locator('[name="city"]').fill("Paris");
  await page.locator('[name="zip_code"]').fill("75001");
  await page.locator('[name="state_region"]').fill("Île-de-France");
  const agreementCards = page.locator(".sidebar-agreement-card");
  for (let index = 0; index < 4; index += 1) {
    await agreementCards.nth(index).click();
  }
}

test.describe("Final checkout installation choice", () => {
  test("keeps add-ons hidden, reviews professional transport, then submits", async ({ page }) => {
    await seedCheckout(page, {
      ...configurationOnlySelection,
      truckCount: 2,
      transportCost: 7_000,
      installationMode: "ossa",
      assemblyCost: 6_500,
      totalPrice: 26_500,
    });

    let checkoutPosts = 0;
    let submittedBody: SubmittedCheckoutBody | null = null;
    let releaseCheckoutResponse!: () => void;
    const checkoutResponseGate = new Promise<void>((resolve) => {
      releaseCheckoutResponse = resolve;
    });
    await page.route("**/api/checkout", async (route) => {
      checkoutPosts += 1;
      submittedBody = route.request().postDataJSON() as SubmittedCheckoutBody;
      await checkoutResponseGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          adminNotificationSent: false,
          clientConfirmationSent: true,
          pdfAttached: true,
          notificationsSent: false,
        }),
      });
    });

    await page.goto("/fr/checkout", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("checkout-configuration-subtotal")).toBeVisible();
    await expect(page.getByTestId("checkout-logistics-section")).toHaveCount(0);
    await expect(page.getByTestId("checkout-transport-row")).toHaveCount(0);
    await expect(page.getByTestId("checkout-assembly-row")).toHaveCount(0);
    await expect(page.getByTestId("checkout-total")).toContainText("13 000,00");
    await expect(page.getByTestId("checkout-logistics-notice")).toContainText("transport est obligatoire");
    await expect(page.getByTestId("checkout-logistics-notice")).toContainText("demande de devis");
    await expect(page.getByTestId("checkout-submit")).toBeEnabled();
    await expect(page.getByTestId("checkout-submit")).toContainText("Continuer : transport et montage");

    await completeCheckoutForm(page);
    await page.getByTestId("checkout-submit").click();

    await expect(page.getByTestId("installation-modal")).toBeVisible();
    await expect(page.getByTestId("installation-confirm")).toBeDisabled();
    expect(checkoutPosts).toBe(0);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("installation-modal")).toHaveCount(0);
    expect(checkoutPosts).toBe(0);

    await page.getByTestId("checkout-submit").click();
    await page.getByTestId("installation-professional").locator("..").click();
    await expect(page.getByTestId("installation-quote")).toContainText("7 000,00");
    await expect(page.getByTestId("installation-confirm")).toBeEnabled();
    await page.getByTestId("installation-confirm").click();

    expect(checkoutPosts).toBe(0);
    await expect(page.getByTestId("installation-modal")).toHaveCount(0);
    await expect(page.getByTestId("checkout-logistics-notice")).toHaveCount(0);
    await expect(page.getByTestId("checkout-review-ready")).toBeVisible();
    await expect(page.getByTestId("checkout-transport-row")).toContainText("7 000,00");
    await expect(page.getByTestId("checkout-assembly-row")).toContainText("Non inclus");
    await expect(page.getByTestId("checkout-total")).toContainText("20 000,00");
    await expect(page.getByText("Demande envoyée avec succès !")).toHaveCount(0);
    await expect(page.getByTestId("checkout-submit")).toContainText("Envoyer ma demande de devis");

    await page.getByTestId("checkout-submit").click();
    await expect.poll(() => checkoutPosts).toBe(1);
    const professionalBody = submittedBody as SubmittedCheckoutBody | null;
    if (!professionalBody) throw new Error("Checkout request was not captured");
    expect(professionalBody.selection.installationMode).toBe("professional");
    expect(professionalBody.selection.transportCost).toBe(7_000);
    expect(professionalBody.selection.assemblyCost).toBe(0);
    expect(professionalBody.total).toBe(20_000);
    releaseCheckoutResponse();
    await expect(page.getByText("Demande envoyée avec succès !")).toBeVisible();
    await expect(
      page.getByText(/Un récapitulatif PDF professionnel/)
    ).toBeVisible();
    await expect(page.getByText(/l'e-mail de confirmation n'a pas pu être envoyé/)).toHaveCount(0);
  });

  test("reviews transport and Ossa Bois assembly before the final submission", async ({ page }) => {
    await seedCheckout(page);

    let submittedBody: SubmittedCheckoutBody | null = null;
    let releaseCheckoutResponse!: () => void;
    const checkoutResponseGate = new Promise<void>((resolve) => {
      releaseCheckoutResponse = resolve;
    });
    await page.route("**/api/checkout", async (route) => {
      submittedBody = route.request().postDataJSON() as SubmittedCheckoutBody;
      await checkoutResponseGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, notificationsSent: true }),
      });
    });

    await page.goto("/fr/checkout", { waitUntil: "domcontentloaded" });
    await completeCheckoutForm(page);
    await page.getByTestId("checkout-submit").click();
    await page.getByTestId("installation-ossa").locator("..").click();

    const quote = page.getByTestId("installation-quote");
    await expect(quote).toContainText("7 000,00");
    await expect(quote).toContainText("6 500,00");
    await expect(quote).toContainText("26 500,00");
    await page.getByTestId("installation-confirm").click();

    expect(submittedBody).toBeNull();
    await expect(page.getByTestId("installation-modal")).toHaveCount(0);
    await expect(page.getByTestId("checkout-review-ready")).toBeVisible();
    await expect(page.getByTestId("checkout-transport-row")).toContainText("7 000,00");
    await expect(page.getByTestId("checkout-assembly-row")).toContainText("6 500,00");
    await expect(page.getByTestId("checkout-total")).toContainText("26 500,00");
    await expect(page.getByText("Demande envoyée avec succès !")).toHaveCount(0);

    await page.getByTestId("change-installation").click();
    await expect(page.getByTestId("installation-ossa")).toBeChecked();
    await page.locator(".installation-back-button").click();
    expect(submittedBody).toBeNull();

    await page.getByTestId("checkout-submit").click();
    await expect.poll(() => submittedBody).not.toBeNull();
    const ossaBody = submittedBody as SubmittedCheckoutBody | null;
    if (!ossaBody) throw new Error("Checkout request was not captured");
    expect(ossaBody.selection.installationMode).toBe("ossa");
    expect(ossaBody.selection.transportCost).toBe(7_000);
    expect(ossaBody.selection.assemblyCost).toBe(6_500);
    expect(ossaBody.total).toBe(26_500);
    releaseCheckoutResponse();
    await expect(page.getByText("Demande envoyée avec succès !")).toBeVisible();
  });

  test("reuses the same order reference after an uncertain failed response", async ({ page }) => {
    await seedCheckout(page);

    const submittedReferences: string[] = [];
    await page.route("**/api/checkout", async (route) => {
      const body = route.request().postDataJSON() as SubmittedCheckoutBody;
      submittedReferences.push(body.orderRef);
      if (submittedReferences.length === 1) {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "Temporary response failure" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          replayed: true,
          adminNotificationSent: false,
          clientConfirmationSent: false,
          pdfAttached: false,
          notificationsSent: false,
        }),
      });
    });
    page.on("dialog", (dialog) => dialog.dismiss());

    await page.goto("/fr/checkout", { waitUntil: "domcontentloaded" });
    await completeCheckoutForm(page);
    await page.getByTestId("checkout-submit").click();
    await page.getByTestId("installation-professional").locator("..").click();
    await page.getByTestId("installation-confirm").click();

    await page.getByTestId("checkout-submit").click();
    await expect.poll(() => submittedReferences.length).toBe(1);
    await expect(page.getByTestId("checkout-submit")).toBeEnabled();

    await page.getByTestId("checkout-submit").click();
    await expect.poll(() => submittedReferences.length).toBe(2);
    expect(submittedReferences[0]).toMatch(/^OB-\d{4}-[A-F0-9]{20}$/);
    expect(submittedReferences[1]).toBe(submittedReferences[0]);
    await expect(page.getByText(/déjà été enregistrée/)).toBeVisible();
  });
});
