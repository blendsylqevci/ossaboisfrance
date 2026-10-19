/** Marketing photography for listing cards; configurator layers keep their aligned originals. */
type MarketingImage = string | { enduit: string; bardage: string };

const marketingImages: Readonly<Record<string, MarketingImage>> = {
  "mountain-valley-villa": {
    enduit: "/images/marketing/mountain-valley-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/mountain-valley-bardage-estate-20261019-4k.webp",
  },
  "mountain-valley-villa-comble": {
    enduit: "/images/marketing/mountain-valley-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/mountain-valley-bardage-estate-20261019-4k.webp",
  },
  "amethyste-me-kulm": {
    enduit: "/images/marketing/amethyste-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/amethyste-bardage-estate-20261019-4k.webp",
  },
  "asebra-me-atike": {
    enduit: "/images/marketing/asebra-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/asebra-attique-bardage-estate-20261019-4k.webp",
  },
  "asebra-avec-attique": {
    enduit: "/images/marketing/asebra-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/asebra-attique-bardage-estate-20261019-4k.webp",
  },
  "boreale-me-atike": {
    enduit: "/images/marketing/boreale-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/boreale-bardage-estate-20261019-4k.webp",
  },
  "boreale-avec-attique": {
    enduit: "/images/marketing/boreale-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/boreale-bardage-estate-20261019-4k.webp",
  },
  "ambre-me-atike": {
    enduit: "/images/marketing/ambre-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/ambre-attique-bardage-estate-20261019-4k.webp",
  },
  "ambre-avec-attique": {
    enduit: "/images/marketing/ambre-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/ambre-attique-bardage-estate-20261019-4k.webp",
  },
  "cotage-toiture-terrasse": {
    enduit: "/images/marketing/cottage-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/cottage-bardage-estate-20261019-4k.webp",
  },
  "diademe-toiture-terrasse": {
    enduit: "/images/marketing/diademe-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/diademe-bardage-estate-20261019-4k.webp",
  },
  "emeraude-toiture-terrasse": {
    enduit: "/images/marketing/emeraude-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/emeraude-attique-bardage-estate-20261019-4k.webp",
  },
  "emeraude-me-atike": {
    enduit: "/images/marketing/emeraude-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/emeraude-attique-bardage-estate-20261019-4k.webp",
  },
  "emeraude-avec-attique": {
    enduit: "/images/marketing/emeraude-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/emeraude-attique-bardage-estate-20261019-4k.webp",
  },
  "escape-villa-me-atike": {
    enduit: "/images/marketing/escape-villa-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/escape-villa-bardage-estate-20261019-4k.webp",
  },
  "escape-villa-avec-attique": {
    enduit: "/images/marketing/escape-villa-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/escape-villa-bardage-estate-20261019-4k.webp",
  },
  "maison-calme": {
    enduit: "/images/marketing/maison-calme-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/maison-calme-bardage-estate-20261019-4k.webp",
  },
  "calme-me-atike": {
    enduit: "/images/marketing/maison-calme-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/maison-calme-bardage-estate-20261019-4k.webp",
  },
  "calme-avec-attique": {
    enduit: "/images/marketing/maison-calme-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/maison-calme-bardage-estate-20261019-4k.webp",
  },
  "enea-me-atike": {
    enduit: "/images/marketing/enea-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/enea-attique-bardage-estate-20261019-4k.webp",
  },
  "enea-avec-attique": {
    enduit: "/images/marketing/enea-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/enea-attique-bardage-estate-20261019-4k.webp",
  },
  "flora-me-atike": {
    enduit: "/images/marketing/flora-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/flora-bardage-estate-20261019-4k.webp",
  },
  "flora-avec-attique": {
    enduit: "/images/marketing/flora-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/flora-bardage-estate-20261019-4k.webp",
  },
  "forest-side-cabin-me-atike": {
    enduit: "/images/marketing/forest-side-cabin-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/forest-side-cabin-bardage-estate-20261019-4k.webp",
  },
  "forest-side-cabin-avec-attique": {
    enduit: "/images/marketing/forest-side-cabin-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/forest-side-cabin-bardage-estate-20261019-4k.webp",
  },
  "maison-en-l-avec-attique": {
    enduit: "/images/marketing/l-shaped-house-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/l-shaped-house-bardage-estate-20261019-4k.webp",
  },
  "france-etage-me-atike": {
    enduit: "/images/marketing/france-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/france-attique-bardage-estate-20261019-4k.webp",
  },
  "france-etage-avec-attique": {
    enduit: "/images/marketing/france-attique-enduit-estate-20261019-4k.webp",
    bardage: "/images/marketing/france-attique-bardage-estate-20261019-4k.webp",
  },
  "symphonie-avec-attique": {
    enduit: "/images/marketing/symphonie-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/symphonie-bardage-luxury-20261019-4k.webp",
  },
  "symphonie-me-atike": {
    enduit: "/images/marketing/symphonie-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/symphonie-bardage-luxury-20261019-4k.webp",
  },
  "maison-emmy": {
    enduit: "/images/marketing/emmy-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/emmy-bardage-luxury-20261019-4k.webp",
  },
  "emmy-house-etage-toiture-terrasse": {
    enduit: "/images/marketing/emmy-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/emmy-bardage-luxury-20261019-4k.webp",
  },
  "regence-avec-attique": {
    enduit: "/images/marketing/regence-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/regence-bardage-luxury-20261019-4k.webp",
  },
  "regence-me-atike": {
    enduit: "/images/marketing/regence-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/regence-bardage-luxury-20261019-4k.webp",
  },
  "monna-avec-attique": {
    enduit: "/images/marketing/monna-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/monna-bardage-luxury-20261019-4k.webp",
  },
  "monna-me-atike": {
    enduit: "/images/marketing/monna-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/monna-bardage-luxury-20261019-4k.webp",
  },
  "melodie-avec-attique": {
    enduit: "/images/marketing/melodie-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/melodie-bardage-luxury-20261019-4k.webp",
  },
  "melodie-me-atike": {
    enduit: "/images/marketing/melodie-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/melodie-bardage-luxury-20261019-4k.webp",
  },
  "marinela-avec-attique": {
    enduit: "/images/marketing/marinela-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/marinela-bardage-luxury-20261019-4k.webp",
  },
  "marinela-me-atike": {
    enduit: "/images/marketing/marinela-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/marinela-bardage-luxury-20261019-4k.webp",
  },
  "a-frame-house": {
    enduit: "/images/marketing/a-frame-flat-roof-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/a-frame-flat-roof-bardage-luxury-20261019-4k.webp",
  },
  "medialuna": {
    enduit: "/images/marketing/medialuna-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/medialuna-bardage-luxury-20261019-4k.webp",
  },
  "maison-loren": {
    enduit: "/images/marketing/maison-loren-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/maison-loren-bardage-luxury-20261019-4k.webp",
  },
  "maison-e": {
    enduit: "/images/marketing/maison-e-enduit-luxury-20261019-4k.webp",
    bardage: "/images/marketing/maison-e-bardage-luxury-20261019-4k.webp",
  },
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
  "nina-house": {
    enduit: "/images/marketing/nina-enduit-luxury-20261016-4k.webp",
    bardage: "/images/marketing/nina-bardage-luxury-20261016-4k.webp",
  },
  "dianne": {
    enduit: "/images/marketing/dianne-enduit-luxury-20261016-4k.webp",
    bardage: "/images/marketing/dianne-bardage-luxury-20261016-4k.webp",
  },
  "cristal": {
    enduit: "/images/marketing/cristal-enduit-luxury-20261016-4k.webp",
    bardage: "/images/marketing/cristal-bardage-luxury-20261016-4k.webp",
  },
  "liberte-etage-avec-attique": {
    enduit: "/images/marketing/liberte-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/liberte-bardage-luxury-20261018-4k.webp",
  },
  "australe": {
    enduit: "/images/marketing/australe-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/australe-bardage-luxury-20261018-4k.webp",
  },
  "sira-avec-attique": {
    enduit: "/images/marketing/sira-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/sira-bardage-luxury-20261018-4k.webp",
  },
  "sira-me-atike": {
    enduit: "/images/marketing/sira-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/sira-bardage-luxury-20261018-4k.webp",
  },
  "palma-etage-avec-attique": {
    enduit: "/images/marketing/palma-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/palma-bardage-luxury-20261018-4k.webp",
  },
  "palma-etage-me-atike": {
    enduit: "/images/marketing/palma-enduit-luxury-20261018-4k.webp",
    bardage: "/images/marketing/palma-bardage-luxury-20261018-4k.webp",
  },
  "maison-2-etages-avec-attique": {
    enduit: "/images/marketing/maison-2-enduit-original-camera-20261018-4k.webp",
    bardage: "/images/marketing/maison-2-bardage-original-camera-20261018-4k.webp",
  },
  "maison-2-etage-me-atike": {
    enduit: "/images/marketing/maison-2-enduit-original-camera-20261018-4k.webp",
    bardage: "/images/marketing/maison-2-bardage-original-camera-20261018-4k.webp",
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
