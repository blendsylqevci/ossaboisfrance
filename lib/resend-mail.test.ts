import test from "node:test";
import assert from "node:assert/strict";
import { sendResendMail } from "./resend-mail.ts";

test("sendResendMail converts transport failures into a non-throwing result", async () => {
  const previousApiKey = process.env.RESEND_API_KEY;
  const previousFetch = globalThis.fetch;
  const previousConsoleError = console.error;

  process.env.RESEND_API_KEY = "test-key";
  globalThis.fetch = async () => {
    throw new Error("simulated timeout");
  };
  console.error = () => {};

  try {
    const result = await sendResendMail({
      to: "client@example.com",
      from: "Ossa Bois <orders@example.com>",
      subject: "Order saved",
      html: "<p>Order saved</p>",
      idempotencyKey: "checkout-client/test-order",
    });

    assert.deepEqual(result, {
      ok: false,
      error: "Email service is temporarily unavailable.",
    });
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousConsoleError;
    if (previousApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousApiKey;
  }
});
