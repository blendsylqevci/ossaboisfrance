import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, getClientIp, rateLimitResponse } from "./rate-limit.ts";

test("checkRateLimit allows up to the limit then blocks", () => {
  const key = `test-${Math.random()}`;
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit(key, 3, 60_000).allowed, true);
  }
  const blocked = checkRateLimit(key, 3, 60_000);
  assert.equal(blocked.allowed, false);
  if (!blocked.allowed) {
    assert.ok(blocked.retryAfterSec >= 1);
  }
});

test("checkRateLimit resets after the window elapses", () => {
  const key = `test-${Math.random()}`;
  assert.equal(checkRateLimit(key, 1, 1).allowed, true);
  // Window of 1ms — a tiny busy wait guarantees expiry.
  const start = Date.now();
  while (Date.now() - start < 5) {
    /* spin */
  }
  assert.equal(checkRateLimit(key, 1, 1).allowed, true);
});

test("getClientIp prefers the first x-forwarded-for entry", () => {
  const req = new Request("https://x.test", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
  });
  assert.equal(getClientIp(req), "1.2.3.4");
});

test("getClientIp falls back to x-real-ip then unknown", () => {
  assert.equal(
    getClientIp(new Request("https://x.test", { headers: { "x-real-ip": "9.9.9.9" } })),
    "9.9.9.9"
  );
  assert.equal(getClientIp(new Request("https://x.test")), "unknown");
});

test("rateLimitResponse returns 429 with Retry-After", () => {
  const res = rateLimitResponse(42);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "42");
});
