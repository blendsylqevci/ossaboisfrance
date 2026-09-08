import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CHECKOUT_TERMS_VERSION,
  validateCheckoutAgreements,
} from "../lib/checkout-legal.ts";
import {
  generateOrderPdf,
  MAX_ORDER_PDF_BYTES,
  type OrderPdfData,
  type OrderPdfOption,
} from "../lib/order-pdf.ts";

const SUPPORTED_LOCALES: OrderPdfData["locale"][] = ["fr", "en", "de", "nl"];

function buildSample(locale: OrderPdfData["locale"]): OrderPdfData {
  const options: OrderPdfOption[] = [
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
  const assembly = 6_500;
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
  if (!agreements) throw new Error("Could not create the sample consent snapshot.");

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
      notes:
        "Toutes les données de cette commande sont fictives. Cette note sert uniquement à contrôler visuellement la hiérarchie, les espacements, les accents et la mise en page du PDF avant sa mise en production.",
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
      installationMode: "ossa",
      assembly,
      grandTotal: configurationSubtotal + transport + assembly,
    },
    agreements,
    contactEmail: "contact@ossaboisfrance.example",
  };
}

function requestedLocales(): OrderPdfData["locale"][] {
  const argument = process.argv.find((value) => value.startsWith("--locale="));
  const requested = argument?.slice("--locale=".length) || "fr";
  if (requested === "all") return SUPPORTED_LOCALES;
  if (!SUPPORTED_LOCALES.includes(requested as OrderPdfData["locale"])) {
    throw new Error("Use --locale=fr, --locale=en, --locale=de, --locale=nl or --locale=all.");
  }
  return [requested as OrderPdfData["locale"]];
}

async function main(): Promise<void> {
  const outputDirectory = path.join(process.cwd(), "output", "pdf");
  await mkdir(outputDirectory, { recursive: true });

  for (const locale of requestedLocales()) {
    const output = await generateOrderPdf(buildSample(locale));
    if (output.byteLength >= MAX_ORDER_PDF_BYTES) {
      throw new Error(`The ${locale} sample exceeds the PDF attachment limit.`);
    }
    const outputPath = path.join(outputDirectory, `ossa-bois-order-sample-${locale}.pdf`);
    await writeFile(outputPath, Uint8Array.from(output), { flag: "w", mode: 0o600 });
    console.log(`${outputPath} (${Math.ceil(output.byteLength / 1024)} KiB)`);
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown PDF sample generation error.";
  console.error(message);
  process.exitCode = 1;
});
