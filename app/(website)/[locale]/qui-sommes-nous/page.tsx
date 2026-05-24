import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { AboutPageClient } from "@/components/AboutPageClient";

type AboutPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `${dict.about.title || "À propos de nous"} | Ossa Bois France`,
    description: dict.about.introText || "Fabricant de maison modulaire à ossature bois.",
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <AboutPageClient locale={locale} dict={dict} />;
}
