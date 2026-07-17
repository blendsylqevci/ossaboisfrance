import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCheckoutGrandTotal,
  calculateOptionsTotal,
  getTransportCost,
  isCheckoutTotalValid,
} from "./checkout-pricing.ts";
import type { HouseConfiguratorData } from "../data/house-configurator.ts";

const mockConfig: Pick<
  HouseConfiguratorData,
  "sizes" | "categories" | "perdhesa"
> = {
  sizes: [
    { id: "60x160", label: "60x160", price: 30000, image: "/a.jpg" },
    { id: "60x200", label: "60x200", price: 35000, image: "/b.jpg" },
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

  it("applies margin and no transport for standard sizes", () => {
    const result = calculateCheckoutGrandTotal(
      mockConfig,
      {
        size: { value: "60x160" },
        isolation: { value: "Laine de verre" },
      },
      40
    );
    assert.ok(!("error" in result));
    const baseWithMargin = 30000 * 1.4;
    const options = 10 * 120;
    assert.equal(result.grandTotal, Math.round(baseWithMargin + options));
    assert.equal(getTransportCost("60x160"), 0);
  });

  it("adds transport for non-standard size id", () => {
    assert.equal(getTransportCost("custom"), 3000);
  });

  it("validates client total within tolerance", () => {
    assert.equal(isCheckoutTotalValid(1000, 1003), true);
    assert.equal(isCheckoutTotalValid(1000, 1010), false);
  });

  it("rejects missing size", () => {
    const result = calculateCheckoutGrandTotal(mockConfig, {}, 40);
    assert.ok("error" in result);
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
      { size: { value: "60x160" } },
      40
    );
    assert.deepEqual(result, { error: "House pricing is not published." });
  });
});
