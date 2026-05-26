import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Ossa Bois France",
  description: "Maisons modulaires a ossature bois."
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
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
