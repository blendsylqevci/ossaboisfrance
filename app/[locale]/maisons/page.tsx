import { HousesArchive } from "@/components/HousesArchive";
import { Locale } from "@/lib/i18n";

type HousesPageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function HousesPage({ params }: HousesPageProps) {
  const { locale } = await params;

  return <HousesArchive locale={locale} />;
}
