type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

// Hard cap on the number of distinct keys held in memory. Without this, an
// attacker minting unlimited keys could grow this Map without bound and OOM
// the serverless instance.
const MAX_BUCKETS = 10_000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

/** Drop expired entries; if still over the cap, evict the soonest-to-reset. */
function pruneBuckets(now: number): void {
  const all: Array<[string, RateLimitEntry]> = [];
  buckets.forEach((v, k) => all.push([k, v]));

  for (let i = 0; i < all.length; i++) {
    if (now >= all[i][1].resetAt) buckets.delete(all[i][0]);
  }

  if (buckets.size >= MAX_BUCKETS) {
    const live = all
      .filter((e) => buckets.has(e[0]))
      .sort((a, b) => a[1].resetAt - b[1].resetAt);
    const dropCount = buckets.size - MAX_BUCKETS + 1;
    for (let i = 0; i < dropCount && i < live.length; i++) {
      buckets.delete(live[i][0]);
    }
  }
}

/**
 * Simple in-memory rate limiter (per server instance).
 * Suitable for Vercel when combined with modest limits; use Redis for strict global caps.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    // Bound memory before inserting a new key (see MAX_BUCKETS).
    if (buckets.size >= MAX_BUCKETS) pruneBuckets(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true };
}

function getRedisCreds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function redisCmd(
  creds: { url: string; token: string },
  command: string[]
): Promise<unknown> {
  const res = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash REST ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

/**
 * Durable rate limiter. Uses Upstash/Vercel KV (Redis) when configured so the
 * limit is shared across all serverless instances and regions; otherwise falls
 * back to the per-instance in-memory limiter. Any Redis error fails open to
 * in-memory so a transient outage never blocks legitimate traffic.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const creds = getRedisCreds();
  if (!creds) return checkRateLimit(key, maxRequests, windowMs);

  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `rl:${key}`;
  try {
    const count = Number(await redisCmd(creds, ["INCR", redisKey]));
    if (count === 1) {
      await redisCmd(creds, ["EXPIRE", redisKey, String(windowSec)]);
    }
    if (count > maxRequests) {
      const ttl = Number(await redisCmd(creds, ["TTL", redisKey]));
      return { allowed: false, retryAfterSec: Math.max(1, ttl) };
    }
    return { allowed: true };
  } catch (err) {
    console.warn("[rate-limit] Redis error, falling back to memory:", err);
    return checkRateLimit(key, maxRequests, windowMs);
  }
}

export function getClientIp(request: Request): string {
  // SECURITY: never key rate limits on the LEFTMOST X-Forwarded-For entry. On
  // Vercel that value is fully client-controlled (the platform appends the real
  // IP rather than replacing a client-supplied header), so trusting it lets an
  // attacker rotate a fake IP per request and get a fresh bucket every time.
  //
  // Prefer the platform-set trusted client IP.
  const trusted =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for");
  if (trusted) {
    const ip = trusted.split(",")[0]?.trim();
    if (ip) return ip;
  }

  // Fallback: take the RIGHTMOST X-Forwarded-For entry (the hop closest to our
  // infrastructure, appended by the platform) rather than the forgeable left.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}
