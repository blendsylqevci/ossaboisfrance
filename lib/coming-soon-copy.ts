import type { Locale } from "@/lib/i18n";

/** Fixed maintenance copy — no CMS editing required. */
export const COMING_SOON_MESSAGE: Record<Locale, string> = {
  fr: "Notre site est en cours de mise à jour. Nous revenons très bientôt.",
  en: "Our website is being updated. We'll be back soon.",
  de: "Unsere Website wird derzeit überarbeitet. Wir sind bald wieder da.",
  nl: "Onze website wordt momenteel bijgewerkt. We zijn snel weer terug.",
};

export function getComingSoonMessage(locale: Locale): string {
  return COMING_SOON_MESSAGE[locale];
}
