type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
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
