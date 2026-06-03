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
  },
  async headers() {
    const securityHeaders = [
      // Force HTTPS for 2 years, including subdomains.
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      // Prevent MIME-type sniffing.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Disallow the site being framed (clickjacking protection).
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Limit referrer leakage.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Disable powerful features we don't use.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withPayload(nextConfig);
