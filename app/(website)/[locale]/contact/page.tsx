import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { ContactPageClient } from "@/components/ContactPageClient";

type ContactPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `${dict.contact.title || "Contactez-nous"} | Ossa Bois France`,
    description: dict.contact.subtitle || "Discutons de votre projet de construction.",
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <ContactPageClient locale={locale} dict={dict} />;
}
