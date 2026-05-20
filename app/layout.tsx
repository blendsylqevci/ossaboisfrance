import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ossa Bois France",
  description: "Maisons modulaires a ossature bois."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
