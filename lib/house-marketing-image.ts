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
  "ambre-me-kulm": {
    enduit: "/images/marketing/ambre-summer-luxury.webp",
    bardage: "/images/marketing/ambre-bardage-luxury-20261015-4k.webp",
  },
  "emeraude-me-kulm": {
    enduit: "/images/marketing/emeraude-enduit-luxury-20261015-4k.webp",
    bardage: "/images/marketing/emeraude-bardage-luxury-20261015-4k.webp",
  },
  "asebra-avec-toit": {
    enduit: "/images/marketing/asebra-enduit-aligned-20261015-4k.webp",
    bardage: "/images/marketing/asebra-bardage-luxury-20261015-4k.webp",
  },
  "france-comble": {
    enduit: "/images/marketing/france-enduit-summer-kitchen-20261015-4k.webp",
    bardage: "/images/marketing/france-bardage-summer-kitchen-20261015-4k.webp",
  },
  "azura-comble": {
    enduit: "/images/marketing/azura-enduit-luxury-20261015-4k.webp",
    bardage: "/images/marketing/azura-bardage-luxury-20261015-4k.webp",
  },
  "elegance-comble": {
    enduit: "/images/marketing/elegance-enduit-luxury-20261015-4k.webp",
    bardage: "/images/marketing/elegance-bardage-luxury-20261015-4k.webp",
  },
  "orenda": {
    enduit: "/images/marketing/orenda-enduit-luxury-20261015-4k.webp",
    bardage: "/images/marketing/orenda-bardage-luxury-20261015-4k.webp",
  },
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
