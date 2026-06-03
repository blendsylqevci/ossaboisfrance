import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // House layer source images (public/images/houses ≈ 630MB) are only read by the
  // dev/staging import routes via fs. Without this, Next traces those fs reads and
  // bundles the whole folder into each /api/import-* serverless function, blowing
  // past Vercel's 300MB function limit and failing production deploys.
  outputFileTracingExcludes: {
    "*": ["public/images/houses/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ossaboisfrance.com",
        pathname: "/wp-content/uploads/**"
      },
      {
        protocol: "https",
        hostname: "spyhpakoxxzceltbdehn.supabase.co",
        pathname: "/**"
      }
    ]
  }
};

export default withPayload(nextConfig);
