import test from "node:test";
import assert from "node:assert/strict";
import { createRecipientRateLimitKey } from "./public-form-rate-limit.ts";

test("recipient rate-limit keys are stable, scoped, and contain no raw PII", () => {
  const previousPayloadSecret = process.env.PAYLOAD_SECRET;
  const previousResendKey = process.env.RESEND_API_KEY;
  process.env.PAYLOAD_SECRET = "test-only-secret";
  delete process.env.RESEND_API_KEY;

  try {
    const contactKey = createRecipientRateLimitKey(
      "contact",
      " Person@Example.com "
    );
    assert.equal(
      contactKey,
      createRecipientRateLimitKey("contact", "person@example.com")
    );
    assert.notEqual(
      contactKey,
      createRecipientRateLimitKey("b2b", "person@example.com")
    );
    assert.doesNotMatch(contactKey, /person|example|@/i);
    assert.match(contactKey, /^contact:recipient:[a-f0-9]{64}$/);
  } finally {
    if (previousPayloadSecret === undefined) delete process.env.PAYLOAD_SECRET;
    else process.env.PAYLOAD_SECRET = previousPayloadSecret;
    if (previousResendKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousResendKey;
  }
});
