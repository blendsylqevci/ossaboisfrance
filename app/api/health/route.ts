import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import {
  runPlatformHealthChecks,
  type PlatformHealthResult,
} from "@/lib/platform-health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTERNAL_CACHE_MS = 10_000;
const STORAGE_FETCH_TIMEOUT_MS = 4_000;

let cachedHealth: { expiresAt: number; result: PlatformHealthResult } | null = null;
let inFlightHealth: Promise<PlatformHealthResult> | null = null;

function trustedStorageHost(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");

  const url = new URL(base);
  if (url.protocol !== "https:") {
    throw new Error("Supabase public URL must use HTTPS");
  }
  return url.hostname;
}

async function performHealthChecks(): Promise<PlatformHealthResult> {
  const payloadPromise = getPayload({ config });

  return runPlatformHealthChecks(
    {
      database: async () => {
        const payload = await payloadPromise;
        await payload.find({
          collection: "houses",
          limit: 1,
          depth: 0,
          pagination: false,
        });
      },
      storage: async () => {
        const payload = await payloadPromise;
        const media = await payload.find({
          collection: "media",
          limit: 1,
          depth: 0,
          pagination: false,
        });
        const mediaUrl = media.docs[0]?.url;
        if (typeof mediaUrl !== "string" || !mediaUrl) {
          throw new Error("No media object is available for the storage probe");
        }

        const url = new URL(mediaUrl);
        if (url.protocol !== "https:" || url.hostname !== trustedStorageHost()) {
          throw new Error("Media URL does not use the trusted Supabase host");
        }

        const response = await fetch(url, {
          method: "HEAD",
          cache: "no-store",
          signal: AbortSignal.timeout(STORAGE_FETCH_TIMEOUT_MS),
        });
        if (!response.ok) {
          throw new Error(`Storage probe returned HTTP ${response.status}`);
        }
      },
    },
    {
      timeoutMs: 6_000,
      onError: (name, error) => {
        console.error(`[health] ${name} check failed:`, error);
      },
    }
  );
}

async function currentHealth(): Promise<PlatformHealthResult> {
  const now = Date.now();
  if (cachedHealth && cachedHealth.expiresAt > now) return cachedHealth.result;
  if (inFlightHealth) return inFlightHealth;

  inFlightHealth = performHealthChecks()
    .then((result) => {
      cachedHealth = { result, expiresAt: Date.now() + INTERNAL_CACHE_MS };
      return result;
    })
    .finally(() => {
      inFlightHealth = null;
    });

  return inFlightHealth;
}

function healthHeaders(): HeadersInit {
  return { "Cache-Control": "no-store, max-age=0" };
}

export async function GET() {
  const health = await currentHealth();
  return NextResponse.json(
    {
      status: health.ok ? "ok" : "degraded",
      checks: health.checks,
      checkedAt: health.checkedAt,
    },
    { status: health.ok ? 200 : 503, headers: healthHeaders() }
  );
}

export async function HEAD() {
  const health = await currentHealth();
  return new NextResponse(null, {
    status: health.ok ? 200 : 503,
    headers: healthHeaders(),
  });
}
