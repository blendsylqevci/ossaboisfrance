import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ossaboisfrance.com",
        pathname: "/wp-content/uploads/**"
      }
    ],
    unoptimized: true
  }
};

export default withPayload(nextConfig);
