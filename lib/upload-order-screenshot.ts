import type { Payload } from "payload";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

// The configurator screenshot is a single canvas capture; a few MB is ample.
// Reject anything larger BEFORE decoding/processing to prevent memory/CPU
// exhaustion (image-bomb DoS) from an attacker-crafted checkout body.
const MAX_SCREENSHOT_BYTES = 6 * 1024 * 1024;
// A 4K screenshot is ~8.3 MP. This allows headroom for high-DPI captures while
// rejecting tiny vector/compressed inputs that declare enormous dimensions
// before Sharp rasterizes them into hundreds of MB of memory.
const MAX_SCREENSHOT_PIXELS = 16_000_000;

export async function uploadOrderScreenshotToMedia(
  payload: Payload,
  base64Image: string,
  orderRef: string
): Promise<string | null> {
  if (typeof base64Image !== "string" || !base64Image.startsWith("data:image/")) {
    return null;
  }

  // Cheap guard on the raw string before allocating the decoded buffer.
  // base64 encodes 3 bytes per 4 chars, so decoded size ≈ length * 3/4.
  if (base64Image.length > (MAX_SCREENSHOT_BYTES * 4) / 3 + 128) {
    return null;
  }

  const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }

  const buffer = Buffer.from(matches[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_SCREENSHOT_BYTES) {
    return null;
  }
  const filename = `order-${orderRef.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${Date.now()}.jpg`;

  const optimized = await optimizeHouseUploadImage(buffer, filename, {
    limitInputPixels: MAX_SCREENSHOT_PIXELS,
  });

  const mediaDoc = await payload.create({
    collection: "media",
    overrideAccess: true,
    data: {
      alt: `Configuration ${orderRef}`,
      mediaType: "gallery",
    },
    file: {
      data: optimized.buffer,
      name: filename,
      mimetype: optimized.mimetype,
      size: optimized.size,
    },
  });

  const url = typeof mediaDoc.url === "string" ? mediaDoc.url : null;
  if (!url) return null;

  if (url.startsWith("http")) {
    return url;
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://ossaboisfrance.com";
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}
