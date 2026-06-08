"use client";

import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { PageLoader } from "@/components/PageLoader";

const labels: Record<Locale, string> = {
  fr: "Chargement",
  en: "Loading",
  de: "Wird geladen",
  nl: "Laden",
};

export function PageLoaderRoute() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0];
  const label = isLocale(segment) ? labels[segment] : labels.fr;

  return <PageLoader label={label} />;
}
