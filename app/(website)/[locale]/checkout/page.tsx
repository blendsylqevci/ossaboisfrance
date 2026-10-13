import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { Locale } from "@/lib/i18n";
import type { Metadata } from "next";

// A customer-specific project review is not a public search landing page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type CheckoutRouteProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { locale } = await params;
  return <CheckoutPage locale={locale} />;
}
