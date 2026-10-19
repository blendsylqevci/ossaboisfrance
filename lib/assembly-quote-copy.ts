/** Keep unpriced assembly explicit in checkout, notifications and the PDF. */
const copy = {
  fr: {
    price: "Sur devis",
    estimate: "Estimation HT hors montage",
    notice: "Montage par Ossa Bois sur devis personnalisé. Le montant affiché comprend la maison et le transport ; le montage sera chiffré séparément.",
  },
  en: {
    price: "On request",
    estimate: "Estimate excl. assembly and VAT",
    notice: "Ossa Bois assembly requires a personalized quote. The displayed amount covers the house and transport; assembly will be priced separately.",
  },
  de: {
    price: "Auf Anfrage",
    estimate: "Nettoschätzung ohne Montage",
    notice: "Montage durch Ossa Bois auf individuelles Angebot. Der angezeigte Betrag umfasst Haus und Transport; die Montage wird separat angeboten.",
  },
  nl: {
    price: "Op aanvraag",
    estimate: "Schatting excl. montage en btw",
    notice: "Montage door Ossa Bois op persoonlijke offerte. Het getoonde bedrag omvat het huis en transport; de montage wordt apart geoffreerd.",
  },
};

export function getAssemblyQuoteCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.fr;
}
