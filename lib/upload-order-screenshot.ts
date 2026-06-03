import type { Payload } from "payload";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

export async function uploadOrderScreenshotToMedia(
  payload: Payload,
  base64Image: string,
  orderRef: string
): Promise<string | null> {
  if (!base64Image.startsWith("data:image/")) {
    return null;
  }

  const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }

  const buffer = Buffer.from(matches[2], "base64");
  const filename = `order-${orderRef.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${Date.now()}.jpg`;

  const optimized = await optimizeHouseUploadImage(buffer, filename);

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
