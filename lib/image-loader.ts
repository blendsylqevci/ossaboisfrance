type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Serve CDN/static URLs directly (no Vercel /_next/image). Append `w=` so
 * Next.js sees width-aware srcset entries and stops missing-loader-width warnings.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}`;
}
