import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { safeJsonLd } from "@/lib/json-ld";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ossaboisfrance.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ossa Bois France",
  description: "Maisons modulaires a ossature bois."
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ossa Bois France",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "50 rue Chanzy",
    postalCode: "28000",
    addressLocality: "Chartres",
    addressCountry: "FR",
  },
  email: "info@ossaboisfrance.com",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;
  return (
    <html lang={locale || "fr"}>
      {SUPABASE_URL ? (
        <head>
          <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={SUPABASE_URL} />
        </head>
      ) : null}
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
