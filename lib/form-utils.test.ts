import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isValidEmail,
  sanitizeText,
  isHoneypotTriggered,
  CONTACT_SUBJECTS,
  B2B_INQUIRY_TYPES,
} from "./form-utils.ts";

test("isValidEmail accepts well-formed addresses", () => {
  assert.equal(isValidEmail("john@example.com"), true);
  assert.equal(isValidEmail("  jane.doe@sub.domain.fr  "), true);
});

test("isValidEmail rejects malformed addresses", () => {
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("missing@domain"), false);
  assert.equal(isValidEmail("@nodomain.com"), false);
  assert.equal(isValidEmail("a@b.c " + "x".repeat(300)), false);
});

test("sanitizeText trims, caps length, and guards non-strings", () => {
  assert.equal(sanitizeText("  hello  ", 100), "hello");
  assert.equal(sanitizeText("abcdef", 3), "abc");
  assert.equal(sanitizeText(42, 100), "");
  assert.equal(sanitizeText(undefined, 100), "");
  assert.equal(sanitizeText(null, 100), "");
});

test("isHoneypotTriggered detects bot-filled hidden fields", () => {
  assert.equal(isHoneypotTriggered("anything"), true);
  assert.equal(isHoneypotTriggered("   "), false);
  assert.equal(isHoneypotTriggered(""), false);
  assert.equal(isHoneypotTriggered(undefined), false);
});

test("allowed subject/inquiry sets are enforced", () => {
  assert.equal(CONTACT_SUBJECTS.has("devis"), true);
  assert.equal(CONTACT_SUBJECTS.has("hack"), false);
  assert.equal(B2B_INQUIRY_TYPES.has("cnc"), true);
  assert.equal(B2B_INQUIRY_TYPES.has("spam"), false);
});
