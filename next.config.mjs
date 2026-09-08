import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // PDFKit runs only in the Node checkout function. Keeping it external avoids
  // bundling native/runtime internals into client or Edge output.
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/checkout": [
      "./public/fonts/*.otf",
      "./public/images/brand/ossa-bois-logo.png",
    ],
  },
  // Raw house, planimetry, and texture sources are only read by local/dev import
  // tooling. Without this, Next traces those fs reads into serverless functions,
  // making every deployment hundreds of megabytes larger.
  outputFileTracingExcludes: {
    "/*": [
      "./public/images/houses/**/*",
      "./public/planimetries-raw/**/*",
      "./public/textures-raw/**/*",
    ],
  },
  images: {
    // Keep originals in Supabase, while serving right-sized WebP derivatives
    // through Next/Vercel. The 3840px ceiling preserves full-detail delivery
    // on large/high-DPR displays without producing an unbounded variant set.
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ossaboisfrance.com",
        port: "",
        pathname: "/wp-content/uploads/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "spyhpakoxxzceltbdehn.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/media/**",
        search: "",
      },
    ],
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

    const isDev = process.env.NODE_ENV !== "production";
    // CSP rollout: Report-Only reports violations without blocking. Flip by
    // unsetting CSP_REPORT_ONLY (or setting it to anything other than "true").
    const cspReportOnly = process.env.CSP_REPORT_ONLY === "true";

    const csp = [
      "default-src 'self'",
      // No nonce: pages are ISR-cached, so a per-request nonce isn't possible.
      // 'unsafe-eval' is dev-only (HMR); production never needs it.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://ossaboisfrance.com https://*.supabase.co",
      "font-src 'self' data:",
      `connect-src 'self' https://api-adresse.data.gouv.fr https://nominatim.openstreetmap.org https://*.supabase.co https://*.sentry.io${
        isDev ? " ws: http://localhost:*" : ""
      }`,
      "frame-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    const cspHeaderKey = cspReportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // These public assets keep their original bytes and dimensions. A
        // bounded browser cache speeds repeat visits while still allowing a
        // future deployment to replace a file at the same path within a day.
        source: "/(fonts|images/brand|images/site|images/hero|media)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Apply CSP to everything except the Payload admin and API routes,
        // which manage their own script/connect needs.
        source: "/((?!api|admin).*)",
        headers: [{ key: cspHeaderKey, value: csp }],
      },
    ];
  },
};

export default withPayload(nextConfig);
