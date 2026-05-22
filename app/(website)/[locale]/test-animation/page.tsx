import { Locale } from "@/lib/i18n";
import HouseLayersScroll from "@/components/HouseLayersScroll";

type TestAnimationPageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function TestAnimationPage({ params }: TestAnimationPageProps) {
  const { locale } = await params;

  return (
    <div className="test-animation-root">
      <HouseLayersScroll locale={locale} />
    </div>
  );
}
