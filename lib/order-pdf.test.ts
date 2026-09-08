import assert from "node:assert/strict";
import test from "node:test";
import {
  CHECKOUT_TERMS_VERSION,
  validateCheckoutAgreements,
} from "./checkout-legal.ts";
import {
  generateOrderPdf,
  isAllowedOrderPdfImageUrl,
  MAX_ORDER_PDF_BYTES,
  validateOrderPdfData,
  type OrderPdfData,
  type OrderPdfOption,
} from "./order-pdf.ts";

const LOCALES: OrderPdfData["locale"][] = ["fr", "en", "de", "nl"];

function makeOrderData(
  locale: OrderPdfData["locale"] = "fr",
  stress = false
): OrderPdfData {
  const options: OrderPdfOption[] = stress
    ? Array.from({ length: 24 }, (_, index) => ({
        categoryLabel: `Catégorie de démonstration ${index + 1}`,
        optionLabel: `Matériau fictif ${index + 1} — finition naturelle haute performance`,
        calculation: `${10 + index} m² × ${20 + index},00 EUR/m²`,
        totalPrice: 200 + index * 10,
      }))
    : [
        {
          categoryLabel: "Isolation extérieure",
          optionLabel: "Fibre de bois — option de démonstration",
          calculation: "120 m² × 17,00 EUR/m²",
          totalPrice: 2_040,
        },
        {
          categoryLabel: "Couverture",
          optionLabel: "Finition fictive anthracite",
          calculation: "Forfait de démonstration",
          totalPrice: 925,
        },
        {
          categoryLabel: "Menuiseries",
          optionLabel: "Triple vitrage — option de démonstration",
          calculation: "Forfait de démonstration",
          totalPrice: 1_635,
        },
      ];
  const optionsTotal = options.reduce((total, option) => total + option.totalPrice, 0);
  const baseStructure = 18_200;
  const configurationSubtotal = baseStructure + optionsTotal;
  const transport = 7_000;
  const agreements = validateCheckoutAgreements(
    {
      shipping: true,
      terms: true,
      urban: true,
      privacy: true,
      version: CHECKOUT_TERMS_VERSION,
    },
    locale,
    new Date("2026-01-15T10:29:30.000Z")
  );
  assert.ok(agreements);

  return {
    locale,
    orderRef: `SAMPLE-${locale.toUpperCase()}-0001`,
    submittedAt: "2026-01-15T10:30:00.000Z",
    customer: {
      name: "Client Démonstration",
      email: "client-demo@example.test",
      phone: "+33 0 00 00 00 00",
    },
    delivery: {
      streetAddress: "Adresse fictive de démonstration",
      city: "Ville Exemple",
      zipCode: "00000",
      stateRegion: "Région Exemple",
      country: "France",
      notes: stress
        ? Array.from(
            { length: 20 },
            (_, index) =>
              `Paragraphe fictif ${index + 1}. Cette note sert uniquement à vérifier la pagination, les accents, les retours à la ligne et l'absence de texte coupé dans le document de démonstration.`
          ).join("\n\n")
        : "Données entièrement fictives utilisées uniquement pour vérifier la mise en page du document.",
    },
    house: {
      name: "Maison Démonstration",
      structureSize: "60 × 160 mm",
    },
    surfaces: {
      net: 91.5,
      gross: 105,
      exteriorWalls: 120,
      roof: 112,
    },
    options,
    pricing: {
      baseStructure,
      optionsTotal,
      configurationSubtotal,
      truckCount: 2,
      transport,
      installationMode: "professional",
      assembly: 0,
      grandTotal: configurationSubtotal + transport,
    },
    agreements,
    contactEmail: "contact@ossaboisfrance.example",
  };
}

test("validateOrderPdfData accepts a complete server-authoritative snapshot", () => {
  assert.doesNotThrow(() => validateOrderPdfData(makeOrderData()));
});

test("validateOrderPdfData rejects inconsistent or client-authored totals", () => {
  const data = makeOrderData();
  data.pricing.grandTotal = 1;
  assert.throws(
    () => validateOrderPdfData(data),
    /grand total is inconsistent/
  );
});

test("validateOrderPdfData rejects an assembly charge in professional mode", () => {
  const data = makeOrderData();
  data.pricing.assembly = 6_500;
  data.pricing.grandTotal += 6_500;
  assert.throws(
    () => validateOrderPdfData(data),
    /Professional assembly must not be charged/
  );
});

test("validateOrderPdfData fails closed for incomplete legal confirmations", () => {
  const data = makeOrderData();
  const malformed = data as unknown as {
    agreements: { privacy: boolean };
  };
  malformed.agreements.privacy = false;
  assert.throws(
    () => validateOrderPdfData(data),
    /agreements are incomplete/
  );
});

test("validateOrderPdfData rejects legal copy that drifts from the accepted snapshot", () => {
  const data = makeOrderData("en");
  data.agreements.text.shipping = "Different transport terms";
  assert.throws(
    () => validateOrderPdfData(data),
    /agreement snapshot does not match/
  );
});

test("order PDF image URLs use an exact HTTPS and public-path allowlist", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousS3Endpoint = process.env.S3_ENDPOINT;

  try {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.ossabois.example";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project-ref.supabase.co";
    delete process.env.S3_ENDPOINT;

    assert.equal(
      isAllowedOrderPdfImageUrl(
        "https://project-ref.supabase.co/storage/v1/object/public/houses/demo.webp"
      ),
      true
    );
    assert.equal(
      isAllowedOrderPdfImageUrl("https://ossaboisfrance.com/images/houses/demo.jpg"),
      true
    );
    assert.equal(
      isAllowedOrderPdfImageUrl("https://preview.ossabois.example/media/demo.png"),
      true
    );
    assert.equal(
      isAllowedOrderPdfImageUrl(
        "https://another-project.supabase.co/storage/v1/object/public/houses/demo.webp"
      ),
      false
    );
    assert.equal(
      isAllowedOrderPdfImageUrl(
        "https://project-ref.supabase.co/storage/v1/object/sign/houses/demo.webp"
      ),
      false
    );
    assert.equal(
      isAllowedOrderPdfImageUrl("https://user:secret@ossaboisfrance.com/images/demo.jpg"),
      false
    );
    assert.equal(
      isAllowedOrderPdfImageUrl("https://ossaboisfrance.com:8443/images/demo.jpg"),
      false
    );
    assert.equal(
      isAllowedOrderPdfImageUrl("http://ossaboisfrance.com/images/demo.jpg"),
      false
    );
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousSupabaseUrl;
    if (previousS3Endpoint === undefined) delete process.env.S3_ENDPOINT;
    else process.env.S3_ENDPOINT = previousS3Endpoint;
  }
});

test(
  "generateOrderPdf produces bounded multi-page A4 documents in every locale",
  { timeout: 30_000 },
  async () => {
    for (const locale of LOCALES) {
      const data = makeOrderData(locale, true);
      const unchangedSnapshot = JSON.stringify(data);
      const pdf = await generateOrderPdf(data);

      assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
      assert.match(pdf.toString("latin1"), /%%EOF\s*$/);
      assert.ok(pdf.byteLength > 20_000, `${locale} PDF should contain the designed document`);
      assert.ok(
        pdf.byteLength < MAX_ORDER_PDF_BYTES,
        `${locale} PDF must stay below the attachment limit`
      );
      const pages = pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
      assert.ok(pages >= 3, `${locale} stress PDF should span at least three pages`);
      assert.equal(JSON.stringify(data), unchangedSnapshot, "generation must not mutate the quote snapshot");
    }
  }
);

test(
  "generateOrderPdf does not append footer-only pages",
  { timeout: 10_000 },
  async () => {
    const pdf = await generateOrderPdf(makeOrderData("fr"));
    const pages = pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
    assert.equal(pages, 2);
  }
);
