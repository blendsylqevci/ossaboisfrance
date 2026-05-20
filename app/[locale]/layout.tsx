import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, Locale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className="site-shell">
      <SiteHeader locale={locale as Locale} />
      <main>{children}</main>
      <SiteFooter locale={locale as Locale} />
    </div>
  );
}
