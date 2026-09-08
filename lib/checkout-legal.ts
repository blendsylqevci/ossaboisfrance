import { isLocale, type Locale } from "./i18n.ts";

export const CHECKOUT_TERMS_VERSION = "2026-09-08";
export const CHECKOUT_ORDER_REFERENCE_PATTERN = /^OB-\d{4}-[A-F0-9]{20}$/;

export function isCheckoutOrderReference(value: unknown): value is string {
  return typeof value === "string" && CHECKOUT_ORDER_REFERENCE_PATTERN.test(value);
}

export type CheckoutConsentCopy = {
  shipping: string;
  terms: string;
  urban: string;
  privacy: string;
};

/**
 * Canonical legal copy shown to the customer and reproduced in the order PDF.
 * Keep the matching SHA-256 value below in sync whenever this copy changes.
 */
export const CHECKOUT_CONSENT_COPY: Readonly<Record<Locale, Readonly<CheckoutConsentCopy>>> = {
  fr: {
    shipping:
      "J'accepte les conditions de livraison par convoi exceptionnel. Je certifie que mon terrain est accessible aux camions grues de gros tonnage.",
    terms:
      "J'accepte les conditions générales de vente et les modalités de paiement qui seront précisées dans le devis personnalisé.",
    urban:
      "Je confirme la conformité de mon projet avec les règles d'urbanisme locales (PLU) et prends connaissance des démarches de permis de construire requises.",
    privacy:
      "J'autorise Ossa Bois à traiter mes données personnelles afin de réaliser l'étude de faisabilité technique et financière de mon projet.",
  },
  en: {
    shipping:
      "I accept the delivery conditions by special convoy. I certify that my plot is accessible for heavy crane trucks.",
    terms:
      "I accept the general terms of sale and the payment terms that will be specified in the personalized quotation.",
    urban:
      "I confirm the compliance of my project with local urban planning regulations (PLU) and accept the building permit steps.",
    privacy:
      "I authorize Ossa Bois to process my personal data in order to conduct the technical and financial feasibility study of my project.",
  },
  de: {
    shipping:
      "Ich akzeptiere die Lieferbedingungen per Spezialtransport. Ich bestätige, dass mein Grundstück für schwere Kranwagen zugänglich ist.",
    terms:
      "Ich akzeptiere die Allgemeinen Geschäftsbedingungen und die Zahlungsbedingungen, die im persönlichen Angebot festgelegt werden.",
    urban:
      "Ich bestätige die Übereinstimmung meines Projekts mit den lokalen Bauvorschriften (B-Plan) und nehme die erforderlichen Baugenehmigungsschritte zur Kenntnis.",
    privacy:
      "Ich ermächtige Ossa Bois, meine personenbezogenen Daten zu verarbeiten, um die technische und finanzielle Machbarkeitsstudie meines Projekts durchzuführen.",
  },
  nl: {
    shipping:
      "Ik accepteer de leveringsvoorwaarden per speciaal transport. Ik verklaar dat mijn grond toegankelijk is voor zware kraanwagens.",
    terms:
      "Ik accepteer de algemene verkoopvoorwaarden en de betalingsvoorwaarden die in de persoonlijke offerte worden vermeld.",
    urban:
      "Ik bevestig de conformiteit van mijn project met de lokale bestemmingsplannen (PLU) en neem kennis van de vereiste bouwvergunningstappen.",
    privacy:
      "Ik geef Ossa Bois toestemming om mijn persoonsgegevens te verwerken om de technische en financiële haalbaarheidsstudie van mijn project uit te voeren.",
  },
};

/** SHA-256 of JSON.stringify(CHECKOUT_CONSENT_COPY[locale]). */
export const CHECKOUT_CONSENT_TEXT_HASHES: Readonly<Record<Locale, string>> = {
  fr: "c015e1b738975f2e31b82d172d21259560869224b7fcc4c1d35103f3651f44b3",
  en: "7ffc121cce334c19c3e3c6abcd8619f43a03376905c10cd73bccea1bb44e3d46",
  de: "43c78eae78bf0f10857dd1ed5a56dc0a1437b9fd4574438574a8ad594811c214",
  nl: "3f0eb42353ff3948099b8ee1e52f98212c85cfc040d4d9bb3aa0e2a18e06868d",
};

export function getCheckoutConsentCopy(locale: string): Readonly<CheckoutConsentCopy> {
  return CHECKOUT_CONSENT_COPY[isLocale(locale) ? locale : "fr"];
}

export function getCheckoutConsentTextHash(locale: string): string {
  return CHECKOUT_CONSENT_TEXT_HASHES[isLocale(locale) ? locale : "fr"];
}

export type CheckoutAgreementsInput = {
  shipping?: unknown;
  terms?: unknown;
  urban?: unknown;
  privacy?: unknown;
  version?: unknown;
};

export type AcceptedCheckoutAgreements = {
  shipping: true;
  terms: true;
  urban: true;
  privacy: true;
  version: typeof CHECKOUT_TERMS_VERSION;
  locale: Locale;
  textHash: string;
  text: CheckoutConsentCopy;
  acceptedAt: string;
};

export function isAcceptedCheckoutAgreementSnapshot(
  value: unknown,
  expectedLocale?: Locale
): value is AcceptedCheckoutAgreements {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const agreements = value as Record<string, unknown>;
  if (
    agreements.shipping !== true ||
    agreements.terms !== true ||
    agreements.urban !== true ||
    agreements.privacy !== true ||
    agreements.version !== CHECKOUT_TERMS_VERSION ||
    typeof agreements.locale !== "string" ||
    !isLocale(agreements.locale) ||
    (expectedLocale !== undefined && agreements.locale !== expectedLocale) ||
    agreements.textHash !== getCheckoutConsentTextHash(agreements.locale) ||
    typeof agreements.acceptedAt !== "string" ||
    Number.isNaN(new Date(agreements.acceptedAt).getTime()) ||
    !agreements.text ||
    typeof agreements.text !== "object" ||
    Array.isArray(agreements.text)
  ) {
    return false;
  }

  const text = agreements.text as Record<string, unknown>;
  const expectedText = getCheckoutConsentCopy(agreements.locale);
  return (
    text.shipping === expectedText.shipping &&
    text.terms === expectedText.terms &&
    text.urban === expectedText.urban &&
    text.privacy === expectedText.privacy
  );
}

export function validateCheckoutAgreements(
  value: unknown,
  locale: Locale = "fr",
  acceptedAt = new Date()
): AcceptedCheckoutAgreements | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (Number.isNaN(acceptedAt.getTime())) return null;

  const agreements = value as CheckoutAgreementsInput;
  if (
    agreements.shipping !== true ||
    agreements.terms !== true ||
    agreements.urban !== true ||
    agreements.privacy !== true ||
    agreements.version !== CHECKOUT_TERMS_VERSION
  ) {
    return null;
  }

  return {
    shipping: true,
    terms: true,
    urban: true,
    privacy: true,
    version: CHECKOUT_TERMS_VERSION,
    locale,
    textHash: getCheckoutConsentTextHash(locale),
    text: { ...getCheckoutConsentCopy(locale) },
    acceptedAt: acceptedAt.toISOString(),
  };
}
