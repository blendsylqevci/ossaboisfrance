export const locales = ["fr", "en", "de", "nl"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  de: "DE",
  nl: "NL"
};
