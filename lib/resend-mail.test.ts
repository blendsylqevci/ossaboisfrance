import test from "node:test";
import assert from "node:assert/strict";
import {
  getResendAuthFromAddress,
  getResendAuthFromEmail,
  getResendB2BFromEmail,
  getResendFromEmail,
  getResendOrderFromEmail,
  getResendReplyToEmail,
  sendResendMail,
} from "./resend-mail.ts";

const RESEND_ENV_KEYS = [
  "RESEND_API_KEY",
  "RESEND_FROM_NAME",
  "RESEND_FROM_ADDRESS",
  "RESEND_FROM_EMAIL",
  "RESEND_ORDER_FROM_ADDRESS",
  "RESEND_ORDER_FROM_EMAIL",
  "RESEND_B2B_FROM_EMAIL",
  "RESEND_AUTH_FROM_ADDRESS",
  "RESEND_REPLY_TO_EMAIL",
  "RESEND_ADMIN_EMAIL",
] as const;

function snapshotResendEnv(): Record<string, string | undefined> {
  return Object.fromEntries(
    RESEND_ENV_KEYS.map((key) => [key, process.env[key]])
  );
}

function restoreResendEnv(snapshot: Record<string, string | undefined>): void {
  for (const key of RESEND_ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test("sendResendMail converts transport failures into a safe non-throwing result", async () => {
  const env = snapshotResendEnv();
  const previousFetch = globalThis.fetch;
  const previousConsoleError = console.error;
  const logs: string[] = [];

  process.env.RESEND_API_KEY = "test-key";
  globalThis.fetch = async () => {
    throw new Error("simulated timeout containing client@example.com");
  };
  console.error = (...args: unknown[]) => logs.push(args.join(" "));

  try {
    const result = await sendResendMail({
      to: "client@example.com",
      from: "Ossa Bois <orders@example.com>",
      subject: "Private order subject",
      html: "<p>Order saved</p>",
      idempotencyKey: "checkout-client/test-order",
      event: "checkout-client",
    });

    assert.deepEqual(result, {
      ok: false,
      error: "Email service is temporarily unavailable.",
    });
    assert.deepEqual(logs, ["[Resend] checkout-client: transport failure."]);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousConsoleError;
    restoreResendEnv(env);
  }
});

test("sendResendMail sends text, Reply-To and a bounded idempotency key with a timeout signal", async () => {
  const env = snapshotResendEnv();
  const previousFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  process.env.RESEND_API_KEY = " test-key ";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({ id: "email-receipt-id" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await sendResendMail({
      to: ["client@example.com"],
      from: "Ossa Bois France <info@example.com>",
      replyTo: "support@example.net",
      subject: "Message received",
      html: "<p>Message received</p>",
      text: "Message received",
      idempotencyKey: "x".repeat(300),
      event: "contact-client",
    });

    assert.deepEqual(result, { ok: true, id: "email-receipt-id" });
    assert.equal(requestUrl, "https://api.resend.com/emails");
    assert.equal(requestInit?.method, "POST");
    assert.ok(requestInit?.signal instanceof AbortSignal);

    const headers = requestInit?.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer test-key");
    assert.equal(headers["Idempotency-Key"].length, 256);

    const body = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;
    assert.equal(body.text, "Message received");
    assert.equal(body.reply_to, "support@example.net");
    assert.deepEqual(body.to, ["client@example.com"]);
  } finally {
    globalThis.fetch = previousFetch;
    restoreResendEnv(env);
  }
});

test("sendResendMail never logs recipient or subject when configuration is missing", async () => {
  const env = snapshotResendEnv();
  const previousFetch = globalThis.fetch;
  const previousConsoleWarn = console.warn;
  const logs: string[] = [];

  process.env.RESEND_API_KEY = "   ";
  globalThis.fetch = async () => {
    throw new Error("fetch must not be called without an API key");
  };
  console.warn = (...args: unknown[]) => logs.push(args.join(" "));

  try {
    const result = await sendResendMail({
      to: "private-recipient@example.com",
      subject: "Private password reset subject",
      html: "<p>Private content</p>",
      event: "password-reset",
    });

    assert.deepEqual(result, {
      ok: false,
      error: "Email service not configured.",
    });
    assert.deepEqual(logs, [
      "[Resend] password-reset: API key missing; message not sent.",
    ]);
    assert.doesNotMatch(logs[0], /private-recipient|Private password/);
  } finally {
    globalThis.fetch = previousFetch;
    console.warn = previousConsoleWarn;
    restoreResendEnv(env);
  }
});

test("sendResendMail reports only a safe event and status for provider errors", async () => {
  const env = snapshotResendEnv();
  const previousFetch = globalThis.fetch;
  const previousConsoleError = console.error;
  const logs: string[] = [];

  process.env.RESEND_API_KEY = "test-key";
  globalThis.fetch = async () =>
    new Response('{"message":"rejected private-recipient@example.com"}', {
      status: 422,
    });
  console.error = (...args: unknown[]) => logs.push(args.join(" "));

  try {
    const result = await sendResendMail({
      to: "private-recipient@example.com",
      subject: "Private subject",
      html: "<p>Private content</p>",
      event: "b2b-client",
    });

    assert.deepEqual(result, { ok: false, error: "Failed to send email." });
    assert.deepEqual(logs, [
      "[Resend] b2b-client: provider request failed (HTTP 422).",
    ]);
    assert.doesNotMatch(logs[0], /private-recipient|Private subject|rejected/);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousConsoleError;
    restoreResendEnv(env);
  }
});

test("sender helpers keep verified From aliases separate from a monitored Reply-To", () => {
  const env = snapshotResendEnv();

  try {
    for (const key of RESEND_ENV_KEYS) delete process.env[key];

    assert.equal(
      getResendFromEmail(),
      "Ossa Bois France <info@ossaboisfrance.com>"
    );
    assert.equal(
      getResendOrderFromEmail(),
      "Ossa Bois France <order@ossaboisfrance.com>"
    );
    assert.equal(getResendAuthFromAddress(), "security@ossaboisfrance.com");
    assert.equal(
      getResendB2BFromEmail(),
      "Ossa Bois France <b2b@ossaboisfrance.com>"
    );
    assert.equal(getResendReplyToEmail(), undefined);

    process.env.RESEND_FROM_NAME = " Ossa Support ";
    process.env.RESEND_FROM_ADDRESS = "sender@example.com";
    process.env.RESEND_ORDER_FROM_ADDRESS = "orders@example.com";
    process.env.RESEND_AUTH_FROM_ADDRESS = "security@example.com";
    process.env.RESEND_ADMIN_EMAIL = "admin@example.net";

    assert.equal(getResendFromEmail(), "Ossa Support <sender@example.com>");
    assert.equal(getResendOrderFromEmail(), "Ossa Support <orders@example.com>");
    assert.equal(
      getResendB2BFromEmail(),
      "Ossa Support <b2b@ossaboisfrance.com>"
    );
    assert.equal(getResendAuthFromEmail(), "Ossa Support <security@example.com>");
    assert.equal(getResendReplyToEmail(), "admin@example.net");

    process.env.RESEND_B2B_FROM_EMAIL = "B2B Desk <b2b@example.com>";
    process.env.RESEND_REPLY_TO_EMAIL = "support@example.net";
    assert.equal(getResendB2BFromEmail(), "B2B Desk <b2b@example.com>");
    assert.equal(getResendReplyToEmail(), "support@example.net");
  } finally {
    restoreResendEnv(env);
  }
});
