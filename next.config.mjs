import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
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
