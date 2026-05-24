import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CookieConsent } from "@/components/CookieConsent";
import { isLocale, Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

export function generateStaticParams() {
  return [
    { locale: "fr" },
    { locale: "en" },
    { locale: "de" },
    { locale: "nl" },
  ];
}

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

  const dict = await getDictionary(locale as Locale);

  return (
    <div className="site-shell">
      <SiteHeader locale={locale as Locale} dict={dict.header} />
      <main>{children}</main>
      <SiteFooter locale={locale as Locale} dict={dict.footer} />
      <CookieConsent locale={locale as Locale} />
    </div>
  );
}
