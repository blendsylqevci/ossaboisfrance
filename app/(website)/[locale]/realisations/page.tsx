import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { RealisationsPageClient } from "@/components/RealisationsPageClient";

type RealisationsPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: RealisationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `${dict.realisations.title || "Nos Réalisations"} | Ossa Bois France`,
    description: dict.realisations.subtitle || "Découvrez des exemples concrets de nos réalisations.",
  };
}

export default async function RealisationsPage({ params }: RealisationsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <RealisationsPageClient locale={locale} dict={dict} />;
}
