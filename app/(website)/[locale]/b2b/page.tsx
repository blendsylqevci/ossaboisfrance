import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { B2BPageClient } from "@/components/B2BPageClient";

type B2BPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: B2BPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `${dict.b2b.title || "B2B & Partenariats"} | Ossa Bois France`,
    description: dict.b2b.subtitle || "Devenez partenaire d'un constructeur à la pointe de l'innovation modulaire.",
  };
}

export default async function B2BPage({ params }: B2BPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <B2BPageClient locale={locale} dict={dict} />;
}
