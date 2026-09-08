import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  CHECKOUT_CONSENT_COPY,
  CHECKOUT_CONSENT_TEXT_HASHES,
  CHECKOUT_TERMS_VERSION,
  isCheckoutOrderReference,
  validateCheckoutAgreements,
} from "./checkout-legal.ts";

test("validates and timestamps all required checkout agreements", () => {
  const acceptedAt = new Date("2026-09-08T08:30:00.000Z");
  const result = validateCheckoutAgreements(
    {
      shipping: true,
      terms: true,
      urban: true,
      privacy: true,
      version: CHECKOUT_TERMS_VERSION,
    },
    "en",
    acceptedAt
  );

  assert.deepEqual(result, {
    shipping: true,
    terms: true,
    urban: true,
    privacy: true,
    version: CHECKOUT_TERMS_VERSION,
    locale: "en",
    textHash: CHECKOUT_CONSENT_TEXT_HASHES.en,
    text: { ...CHECKOUT_CONSENT_COPY.en },
    acceptedAt: acceptedAt.toISOString(),
  });
});

test("keeps every localized consent snapshot tied to its exact SHA-256", () => {
  for (const locale of ["fr", "en", "de", "nl"] as const) {
    const actual = createHash("sha256")
      .update(JSON.stringify(CHECKOUT_CONSENT_COPY[locale]), "utf8")
      .digest("hex");
    assert.equal(actual, CHECKOUT_CONSENT_TEXT_HASHES[locale]);
  }
});

test("accepts only the canonical checkout order-reference format", () => {
  assert.equal(isCheckoutOrderReference("OB-2026-0123456789ABCDEFABCD"), true);
  assert.equal(isCheckoutOrderReference("OB-2026-0123456789AB"), false);
  assert.equal(isCheckoutOrderReference("OB-2026-0123456789abcdefABCD"), false);
  assert.equal(isCheckoutOrderReference("prefix-OB-2026-0123456789ABCDEFABCD"), false);
});

test("rejects missing, false, or stale checkout agreements", () => {
  assert.equal(validateCheckoutAgreements(undefined), null);
  assert.equal(
    validateCheckoutAgreements({
      shipping: true,
      terms: false,
      urban: true,
      privacy: true,
      version: CHECKOUT_TERMS_VERSION,
    }),
    null
  );
  assert.equal(
    validateCheckoutAgreements({
      shipping: true,
      terms: true,
      urban: true,
      privacy: true,
      version: "outdated",
    }),
    null
  );
});
