import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  checkRateLimitAsync,
  getClientIp,
  rateLimitResponse,
} from "./rate-limit.ts";

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

test("Redis limiter repairs a counter that lost its expiry", async () => {
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalFetch = globalThis.fetch;
  const commands: string[][] = [];

  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  globalThis.fetch = (async (_input, init) => {
    const command = JSON.parse(String(init?.body)) as string[];
    commands.push(command);
    const result = command[0] === "INCR" ? 1 : command[0] === "TTL" ? -1 : 1;
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as typeof fetch;

  try {
    assert.deepEqual(await checkRateLimitAsync("repair-test", 2, 60_000), {
      allowed: true,
    });
    assert.deepEqual(
      commands.map(([name]) => name),
      ["INCR", "TTL", "EXPIRE"]
    );
    assert.deepEqual(commands[2], ["EXPIRE", "rl:repair-test", "60"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
  }
});

test("getClientIp prefers trusted x-real-ip over a spoofable x-forwarded-for", () => {
  // A client can forge the LEFTMOST x-forwarded-for; x-real-ip is platform-set
  // and must win so an attacker cannot rotate buckets by spoofing XFF.
  const req = new Request("https://x.test", {
    headers: {
      "x-forwarded-for": "6.6.6.6, 5.6.7.8",
      "x-real-ip": "9.9.9.9",
    },
  });
  assert.equal(getClientIp(req), "9.9.9.9");
});

test("getClientIp uses the RIGHTMOST x-forwarded-for when no trusted header", () => {
  const req = new Request("https://x.test", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
  });
  // Leftmost (1.2.3.4) is attacker-controlled; rightmost (5.6.7.8) is closest to us.
  assert.equal(getClientIp(req), "5.6.7.8");
});

test("getClientIp falls back to x-vercel-forwarded-for then unknown", () => {
  assert.equal(
    getClientIp(
      new Request("https://x.test", {
        headers: { "x-vercel-forwarded-for": "9.9.9.9" },
      })
    ),
    "9.9.9.9"
  );
  assert.equal(getClientIp(new Request("https://x.test")), "unknown");
});

test("rateLimitResponse returns 429 with Retry-After", () => {
  const res = rateLimitResponse(42);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "42");
});
