/** Marketing photography for listing cards; configurator layers keep their aligned originals. */
const marketingImages: Readonly<Record<string, string>> = {
  "symphonie-avec-attique": "/images/marketing/symphonie-claire-voie-viroc.webp",
  "symphonie-me-atike": "/images/marketing/symphonie-claire-voie-viroc.webp",
  "enea-avec-toit": "/images/marketing/enea-family-luxury.webp",
  "maison-enea-me-kulm": "/images/marketing/enea-family-luxury.webp",
  "a-frame-house-me-kulm": "/images/marketing/a-frame-bardage-autumn-gpt2.webp",
  "ambre-me-kulm": "/images/marketing/ambre-summer-luxury.webp",
  "emeraude-me-kulm": "/images/marketing/emeraude-summer-luxury.webp",
  "asebra-avec-toit": "/images/marketing/asebra-summer-luxury.webp",
};

export function hasHouseMarketingImage(slug: string): boolean {
  return Object.hasOwn(marketingImages, slug);
}

export function getHouseMarketingImage(slug: string, defaultImage: string): string {
  if (hasHouseMarketingImage(slug)) {
    return marketingImages[slug];
  }

  return defaultImage;
}
