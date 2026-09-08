import test from "node:test";
import assert from "node:assert/strict";
import {
  PRIVACY_ACCEPTED_VALUE,
  checkDeclaredRequestSize,
  hasPdfSignature,
  isPrivacyAccepted,
} from "./public-form-security.ts";

test("privacy acceptance permits only explicit supported representations", () => {
  assert.equal(isPrivacyAccepted(true), true);
  assert.equal(isPrivacyAccepted(PRIVACY_ACCEPTED_VALUE), true);
  assert.equal(isPrivacyAccepted(false), false);
  assert.equal(isPrivacyAccepted("true"), false);
  assert.equal(isPrivacyAccepted("false"), false);
  assert.equal(isPrivacyAccepted(1), false);
});

test("declared request size rejects malformed and oversized values", () => {
  assert.deepEqual(checkDeclaredRequestSize(null, 100), { status: "missing" });
  assert.deepEqual(checkDeclaredRequestSize("99", 100), {
    status: "ok",
    bytes: 99,
  });
  assert.deepEqual(checkDeclaredRequestSize("101", 100), {
    status: "too-large",
  });
  assert.deepEqual(checkDeclaredRequestSize("1e2", 100), {
    status: "invalid",
  });
  assert.deepEqual(checkDeclaredRequestSize("-1", 100), {
    status: "invalid",
  });
  assert.deepEqual(checkDeclaredRequestSize("9".repeat(40), 100), {
    status: "too-large",
  });
});

test("PDF signature check rejects extension-only disguises", () => {
  assert.equal(
    hasPdfSignature(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])),
    true
  );
  assert.equal(
    hasPdfSignature(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])),
    false
  );
  assert.equal(hasPdfSignature(new Uint8Array([0x25, 0x50])), false);
});
