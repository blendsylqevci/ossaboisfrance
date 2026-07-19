import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { Locale } from "@/lib/i18n";

type CheckoutRouteProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { locale } = await params;
  return <CheckoutPage locale={locale} />;
}
