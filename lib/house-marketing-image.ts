/** Marketing photography for listing cards; configurator layers keep their aligned originals. */
type MarketingImage = string | { enduit: string; bardage: string };

const marketingImages: Readonly<Record<string, MarketingImage>> = {
  "symphonie-avec-attique": "/images/marketing/symphonie-claire-voie-viroc.webp",
  "symphonie-me-atike": "/images/marketing/symphonie-claire-voie-viroc.webp",
  "enea-avec-toit": {
    enduit: "/images/marketing/enea-summer-enduit.webp",
    bardage: "/images/marketing/enea-summer-bardage.webp",
  },
  "maison-enea-me-kulm": {
    enduit: "/images/marketing/enea-summer-enduit.webp",
    bardage: "/images/marketing/enea-summer-bardage.webp",
  },
  "a-frame-house-me-kulm": {
    enduit: "/images/marketing/a-frame-autumn-enduit-4k.webp",
    bardage: "/images/marketing/a-frame-autumn-bardage-original.webp",
  },
  "ambre-me-kulm": "/images/marketing/ambre-summer-luxury.webp",
  "emeraude-me-kulm": "/images/marketing/emeraude-summer-luxury.webp",
  "asebra-avec-toit": "/images/marketing/asebra-summer-luxury.webp",
  "france-comble": "/images/marketing/france-summer-luxury.webp",
  "els-house-comble": {
    enduit: "/images/marketing/els-house-summer-enduit-roof-wrap.webp",
    bardage: "/images/marketing/els-house-summer-bardage.webp",
  },
};

export function hasHouseMarketingImage(slug: string): boolean {
  return Object.hasOwn(marketingImages, slug);
}

export function getHouseMarketingImage(slug: string, defaultImage: string): string {
  if (hasHouseMarketingImage(slug)) {
    const image = marketingImages[slug];
    return typeof image === "string" ? image : image.enduit;
  }

  return defaultImage;
}

export function hasHouseMarketingComparison(slug: string): boolean {
  return hasHouseMarketingImage(slug) && typeof marketingImages[slug] !== "string";
}

export function getHouseMarketingBardageImage(slug: string, defaultImage: string): string {
  const image = marketingImages[slug];
  return hasHouseMarketingComparison(slug) && typeof image !== "string"
    ? image.bardage
    : defaultImage;
}
