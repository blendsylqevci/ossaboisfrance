import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCheckoutGrandTotal,
  calculateOptionsTotal,
  isCheckoutTotalValid,
} from "./checkout-pricing.ts";
import type { HouseConfiguratorData } from "../data/house-configurator.ts";

const mockConfig: Pick<
  HouseConfiguratorData,
  "categorySlug" | "sizes" | "categories" | "perdhesa"
> = {
  categorySlug: "maison-plein-pied",
  sizes: [
    { id: "60x160", label: "60x160", price: 13000, image: "/a.jpg" },
    { id: "60x200", label: "60x200", price: 15000, image: "/b.jpg" },
  ],
  perdhesa: {
    bruto: 100,
    neto: 90,
    mure_te_jashtme: 120,
    mure_mbajtese: 30,
    mure_ndarese: 20,
    pllaka_e_kulmit: 80,
    kulmi: 80,
  },
  categories: [
    {
      id: "isolation",
      inputName: "house_isolation",
      label: "Isolation",
      priceMode: "wall_m2",
      options: [
        {
          id: "verre",
          label: "Laine de verre",
          price160: 10,
          price200: 12,
          layerKey: "iso_verre",
          layer: "/layer.png",
        },
      ],
    },
    {
      id: "etancheite",
      inputName: "house_etancheite",
      label: "Etancheite",
      priceMode: "roof_m2",
      options: [
        {
          id: "epdm",
          label: "EPDM",
          price160: 5,
          layerKey: "epdm",
          layer: "/epdm.png",
        },
      ],
    },
  ],
};

describe("checkout-pricing", () => {
  it("calculates wall_m2 and roof_m2 options", () => {
    const total = calculateOptionsTotal(
      mockConfig.categories,
      {
        isolation: { value: "Laine de verre" },
        etancheite: { value: "EPDM" },
      },
      "60x160",
      mockConfig.perdhesa
    );
    assert.equal(total, 10 * 120 + 5 * 80);
  });

  it("rejects an explicitly supplied unknown option", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {
      size: { value: "60x160" },
      isolation: { value: "unknown-option" },
      installationMode: "professional",
    });
    assert.deepEqual(result, {
      error: "Unknown option selection for isolation.",
    });
  });

  it("rejects selected per-square-metre options without their pricing surface", () => {
    const result = calculateCheckoutGrandTotal(
      {
        ...mockConfig,
        perdhesa: { ...mockConfig.perdhesa, mure_te_jashtme: 0 },
      },
      {
        size: { value: "60x160" },
        isolation: { value: "verre" },
        installationMode: "professional",
      }
    );
    assert.deepEqual(result, {
      error: "Missing pricing surface for isolation.",
    });
  });

  it("rejects negative or non-finite selected option prices", () => {
    const result = calculateCheckoutGrandTotal(
      {
        ...mockConfig,
        categories: mockConfig.categories.map((category) =>
          category.id === "isolation"
            ? {
                ...category,
                options: category.options.map((option) => ({
                  ...option,
                  price160: -1,
                })),
              }
            : category
        ),
      },
      {
        size: { value: "60x160" },
        isolation: { value: "verre" },
        installationMode: "professional",
      }
    );
    assert.deepEqual(result, {
      error: "Invalid option price for isolation.",
    });
  });

  it("calculates a server-authoritative professional quote", () => {
    const result = calculateCheckoutGrandTotal(
      mockConfig,
      {
        size: { value: "60x160" },
        isolation: { value: "Laine de verre" },
        installationMode: "professional",
      }
    );
    assert.ok(!("error" in result));
    assert.equal(result.baseStructurePrice, 100 * 130);
    assert.equal(result.optionsTotal, 10 * 120);
    assert.equal(result.truckCount, 2);
    assert.equal(result.transportCost, 7_000);
    assert.equal(result.assemblyCost, 0);
    assert.equal(result.grandTotal, 13_000 + 1_200 + 7_000);
  });

  it("adds Ossa assembly separately", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {
      size: { value: "60x200" },
      installationMode: "ossa",
    });
    assert.ok(!("error" in result));
    assert.equal(result.baseStructurePrice, 100 * 150);
    assert.equal(result.transportCost, 7_000);
    assert.equal(result.assemblyCost, 6_500);
    assert.equal(result.grandTotal, 28_500);
  });

  it("ignores every client-authored cost and recalculates the quote", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {
      size: { value: "60x160" },
      installationMode: "professional",
      basePrice: 1,
      optionsTotal: 1,
      configurationSubtotal: 1,
      truckCount: 1,
      transportCost: 1,
      assemblyCost: 1,
      totalPrice: 1,
    });
    assert.ok(!("error" in result));
    assert.equal(result.baseStructurePrice, 13_000);
    assert.equal(result.transportCost, 7_000);
    assert.equal(result.assemblyCost, 0);
    assert.equal(result.grandTotal, 20_000);
  });

  it("validates client total within tolerance", () => {
    assert.equal(isCheckoutTotalValid(1000.004, 1000), true);
    assert.equal(isCheckoutTotalValid(1000.01, 1000), false);
    assert.equal(isCheckoutTotalValid("1000", 1000), false);
  });

  it("rejects missing size", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {});
    assert.ok("error" in result);
  });

  it("rejects checkout until an installation mode is selected", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {
      size: { value: "60x160" },
    });
    assert.deepEqual(result, { error: "Missing installation selection." });
  });

  it("rejects an unknown installation mode", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {
      size: { value: "60x160" },
      installationMode: "free-assembly",
    });
    assert.deepEqual(result, { error: "Missing installation selection." });
  });

  it("rejects checkout when the selected house price is unpublished", () => {
    const unpublishedConfig = {
      ...mockConfig,
      sizes: [
        {
          id: "60x160" as const,
          label: "60x160",
          price: 0,
          image: "/a.jpg",
          priceAvailable: false,
        },
      ],
    };
    const result = calculateCheckoutGrandTotal(
      unpublishedConfig,
      { size: { value: "60x160" }, installationMode: "professional" }
    );
    assert.deepEqual(result, { error: "House pricing is not published." });
  });
});
