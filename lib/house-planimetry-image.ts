import floorPlans from "./house-planimetry-floors.json";

/** Approved 3D floor-plan visuals; other houses retain their existing plans. */
const planimetryImages: Readonly<Record<string, string>> = {
  "a-frame-house": "/images/planimetries/a-frame-house-photoreal-20261021.webp",
  "a-frame-house-me-kulm": "/images/planimetries/a-frame-house-photoreal-20261021.webp",
  "medialuna": "/images/planimetries/medialuna-photoreal-20261111.webp",
  "symphonie-avec-attique": "/images/planimetries/symphonie-avec-attique-photoreal-20261022.webp",
  "regence-avec-attique": "/images/planimetries/regence-avec-attique-photoreal-20261022.webp",
  "monna-avec-attique": "/images/planimetries/monna-avec-attique-photoreal-20261022.webp",
  "melodie-avec-attique": "/images/planimetries/melodie-avec-attique-photoreal-20261022.webp",
  "marinela-avec-attique": "/images/planimetries/marinela-avec-attique-photoreal-20261022.webp",
  "emeraude-avec-attique": "/images/planimetries/emeraude-avec-attique-photoreal-20261111.webp",
  "emeraude-me-kulm": "/images/planimetries/emeraude-avec-attique-photoreal-20261111.webp",
  "maison-loren": "/images/planimetries/maison-loren-photoreal-20261111.webp",
  "maison-e": "/images/planimetries/maison-e-photoreal-20261111.webp",
  "maison-en-l-avec-attique": "/images/planimetries/maison-en-l-avec-attique-photoreal-20261111.webp",
  "forest-side-cabin-avec-attique": "/images/planimetries/forest-side-cabin-avec-attique-photoreal-20261111.webp",
  "flora-avec-attique": "/images/planimetries/flora-avec-attique-photoreal-20261111.webp",
  "calme-avec-attique": "/images/planimetries/calme-avec-attique-photoreal-20261111.webp",
  "escape-villa-avec-attique": "/images/planimetries/escape-villa-avec-attique-photoreal-20261111.webp",
  "diademe-toiture-terrasse": "/images/planimetries/diademe-toiture-terrasse-photoreal-20261111.webp",
  "cotage-toiture-terrasse": "/images/planimetries/cotage-toiture-terrasse-photoreal-20261111.webp",
  "asebra-avec-attique": "/images/planimetries/asebra-avec-attique-photoreal-20261111.webp",
  "boreale-avec-attique": "/images/planimetries/boreale-avec-attique-photoreal-20261111.webp",
  "ambre-avec-attique": "/images/planimetries/ambre-avec-attique-photoreal-20261111.webp",
  "ambre-me-kulm": "/images/planimetries/ambre-avec-attique-photoreal-20261111.webp",
};

export function getHousePlanimetryImage(slug: string, fallback: string): string {
  return getHousePlanimetryPages(slug, fallback)[0]?.src || "";
}

export type HousePlanimetryPage = {
  src: string;
  level: "ground" | "upper" | null;
};

export function getHousePlanimetryPages(slug: string, fallback: string): HousePlanimetryPage[] {
  const pages = (floorPlans as Record<string, HousePlanimetryPage[]>)[slug];
  if (pages?.length) return pages;
  const src = planimetryImages[slug] || fallback;
  return src ? [{ src, level: null }] : [];
}

const floorLabels: Record<string, { ground: string; upper: string }> = {
  fr: { ground: "Rez-de-chaussée", upper: "Étage" },
  en: { ground: "Ground floor", upper: "First floor" },
  de: { ground: "Erdgeschoss", upper: "Obergeschoss" },
  nl: { ground: "Begane grond", upper: "Verdieping" },
};

export function getHousePlanimetryLevelLabel(level: HousePlanimetryPage["level"], locale: string): string {
  return level ? (floorLabels[locale] || floorLabels.fr)[level] : "";
}
