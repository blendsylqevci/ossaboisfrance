const SUPABASE_PUBLIC_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
  /\/+$/,
  ""
);
const MEDIA_BUCKET = process.env.S3_BUCKET || "media";

/**
 * Public Supabase Storage CDN URL for a media file.
 *
 * Files are served directly from Supabase's CDN (browser → CDN), bypassing the
 * Next.js/Payload function. This is dramatically faster than the previous
 * `/api/media/file/...` route, which streamed every asset through a serverless
 * function with `Cache-Control: max-age=0` (uncacheable). Image quality is
 * unchanged — the same original file is served.
 */
export function publicMediaUrl(filename: string, prefix?: string): string {
  const key = prefix ? `${prefix}/${filename}` : filename;
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}
