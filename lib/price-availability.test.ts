import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPublishedHousePrice } from "./price-availability.ts";

describe("price availability", () => {
  it("treats the CMS value 1 as an unpublished placeholder", () => {
    assert.equal(isPublishedHousePrice(1), false);
  });

  it("rejects missing, zero, negative, and non-finite prices", () => {
    assert.equal(isPublishedHousePrice(null), false);
    assert.equal(isPublishedHousePrice(undefined), false);
    assert.equal(isPublishedHousePrice(0), false);
    assert.equal(isPublishedHousePrice(-1), false);
    assert.equal(isPublishedHousePrice(Number.NaN), false);
    assert.equal(isPublishedHousePrice(Number.POSITIVE_INFINITY), false);
  });

  it("accepts an approved positive house price above the marker", () => {
    assert.equal(isPublishedHousePrice(27_850), true);
  });
});
