import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CookieConsent } from "@/components/CookieConsent";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { isLocale, Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getSiteSettings } from "@/lib/site-settings";

// Cache public pages at the edge. CMS hooks invalidate these routes immediately
// after house, pricing, or maintenance-mode changes; this is only a safety TTL.
export const revalidate = 600;

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

  const [dict, siteSettings] = await Promise.all([
    getDictionary(locale as Locale),
    getSiteSettings(),
  ]);

  if (siteSettings.comingSoonEnabled) {
    return (
      <div className="site-shell">
        <ComingSoonPage locale={locale as Locale} />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <SiteHeader locale={locale as Locale} dict={dict.header} />
      <main>{children}</main>
      <SiteFooter locale={locale as Locale} dict={dict.footer} />
      <CookieConsent locale={locale as Locale} />
    </div>
  );
}
