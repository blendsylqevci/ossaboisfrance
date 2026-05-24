import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

type CheckoutRouteProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <CheckoutPage locale={locale} dict={dict} />;
}

