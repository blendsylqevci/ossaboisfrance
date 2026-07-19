import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateStructurePrice,
  getAssemblyCost,
  getStructureRate,
  getTransportQuote,
  isValidGrossArea,
} from "./house-pricing.ts";

describe("house-pricing", () => {
  it("uses the requested gross-m2 structure rates for every category group", () => {
    const expectedRates = {
      "maison-combles-ammenageable": [140, 160],
      "maison-avec-etage": [140, 160],
      "maison-plein-pied": [130, 150],
      "maison-toitu-terrasse": [150, 170],
      "maison-sans-faitage": [150, 170],
    } as const;

    for (const [category, [rate160, rate200]] of Object.entries(expectedRates)) {
      assert.equal(getStructureRate(category, "60x160"), rate160);
      assert.equal(getStructureRate(category, "60x200"), rate200);
    }
  });

  it("calculates the structure from Bruto and does not apply the legacy margin", () => {
    assert.equal(calculateStructurePrice("maison-plein-pied", 100, "60x160"), 13_000);
    assert.equal(calculateStructurePrice("maison-avec-etage", 136, "60x200"), 21_760);
    assert.equal(calculateStructurePrice("maison-toitu-terrasse", 117.86, "60x160"), 17_679);
  });

  it("treats imported 0/1 measurements and unknown categories as unpublished", () => {
    assert.equal(isValidGrossArea(0), false);
    assert.equal(isValidGrossArea(1), false);
    assert.equal(calculateStructurePrice("maison-plein-pied", 1, "60x160"), null);
    assert.equal(calculateStructurePrice("unknown", 100, "60x160"), null);
  });

  it("charges one EUR 3,500 truck for every started 50 gross m2", () => {
    assert.deepEqual(getTransportQuote(80), { truckCount: 2, cost: 7_000 });
    assert.deepEqual(getTransportQuote(100), { truckCount: 2, cost: 7_000 });
    assert.deepEqual(getTransportQuote(100.01), { truckCount: 3, cost: 10_500 });
    assert.deepEqual(getTransportQuote(120), { truckCount: 3, cost: 10_500 });
    assert.deepEqual(getTransportQuote(150), { truckCount: 3, cost: 10_500 });
    assert.deepEqual(getTransportQuote(170), { truckCount: 4, cost: 14_000 });
    assert.deepEqual(getTransportQuote(200), { truckCount: 4, cost: 14_000 });
    assert.deepEqual(getTransportQuote(200.01), { truckCount: 5, cost: 17_500 });
  });

  it("applies the requested Ossa assembly tiers and excludes it for professionals", () => {
    assert.equal(getAssemblyCost(80, "ossa"), 6_500);
    assert.equal(getAssemblyCost(100, "ossa"), 6_500);
    assert.equal(getAssemblyCost(100.01, "ossa"), 9_000);
    assert.equal(getAssemblyCost(150, "ossa"), 9_000);
    assert.equal(getAssemblyCost(150.01, "ossa"), 10_000);
    assert.equal(getAssemblyCost(200, "ossa"), 10_000);
    assert.equal(getAssemblyCost(170, "professional"), 0);
    assert.equal(getAssemblyCost(79.99, "ossa"), null);
    assert.equal(getAssemblyCost(200.01, "ossa"), null);
  });
});
