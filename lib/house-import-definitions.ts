import type { HouseFileMappingEntry } from "@/lib/house-import";
import { findArchiveHouse } from "@/data/houses-archive";

export type HouseImportTemplate =
  | "attique"
  | "attique-calme"
  | "attique-a-frame"
  | "comble";

export interface HouseImportDefinition {
  slug: string;
  legacySlugs?: string[];
  title: string;
  layersFolderName: string;
  categorySlug: string;
  defaultImageFile: string;
  finalImageFile: string;
  template: HouseImportTemplate;
  preservePricingOnUpdate?: boolean;
  allowMissingHeroOnUpdate?: boolean;
  price60x160?: number;
  price60x200?: number;
  placeholderNeto?: number;
  subheading?: string;
  description?: string;
  fileMappingExtras?: Record<string, HouseFileMappingEntry>;
}

function fromArchive(
  slug: string,
  partial: Omit<
    HouseImportDefinition,
    "slug" | "title" | "price60x160" | "description" | "subheading"
  > & { title?: string }
): HouseImportDefinition {
  const arch = findArchiveHouse(slug);
  return {
    ...partial,
    slug,
    title: partial.title ?? arch?.title ?? slug,
    description: arch?.description,
    price60x160: arch?.price60x160 ?? undefined,
  };
}

/** Houses not yet covered by `lib/house-import-configs/*.ts` (14 existing). */
export const additionalHouseImportDefinitions: HouseImportDefinition[] = [
  fromArchive("a-frame-house", {
    layersFolderName: "A frame house me atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "10 a frame house.jpg",
    finalImageFile: "10 a frame house.jpg",
    template: "attique-a-frame",
    price60x200: 17022,
  }),
  fromArchive("maison-loren", {
    layersFolderName: "Maison Loren me atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "LOREN 7.jpg",
    finalImageFile: "LOREN 10.jpg",
    template: "attique",
    price60x200: 20716,
  }),
  fromArchive("ambre-avec-attique", {
    legacySlugs: ["ambre-me-atike"],
    layersFolderName: "ambre me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 ambre.jpg",
    finalImageFile: "10 ambre.jpg",
    template: "attique",
    preservePricingOnUpdate: true,
    price60x200: 29300,
  }),
  fromArchive("boreale-avec-attique", {
    legacySlugs: ["boreale-me-atike"],
    layersFolderName: "Boreale me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 boreale.jpg",
    finalImageFile: "10 boreale.jpg",
    template: "attique",
    preservePricingOnUpdate: true,
    price60x200: 29300,
  }),
  {
    slug: "calme-avec-attique",
    legacySlugs: ["calme-me-atike", "maison-calme"],
    title: "Maison Calme avec Attique",
    layersFolderName: "calme-atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "7 CALME.jpg",
    finalImageFile: "10 CALME.jpg",
    template: "attique-calme",
    preservePricingOnUpdate: true,
    price60x160: 31292,
    description: findArchiveHouse("maison-calme")?.description,
    fileMappingExtras: {
      "7 CALME.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: "Maison Calme — 60×160",
      },
      "10 CALME.jpg": {
        field: "finalImage",
        mediaType: "final_render",
        alt: "Maison Calme — 60×200",
      },
    },
  },
  fromArchive("asebra-avec-attique", {
    legacySlugs: ["asebra-me-atike"],
    layersFolderName: "asebra me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "4 asebra.jpg",
    finalImageFile: "5 asebra.jpg",
    template: "attique",
    preservePricingOnUpdate: true,
    price60x200: 30300,
  }),
  fromArchive("cotage-toiture-terrasse", {
    layersFolderName: "cotage me atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "4 cottage.jpg",
    finalImageFile: "5 cottage.jpg",
    template: "attique",
    price60x200: 24900,
  }),
  fromArchive("diademe-toiture-terrasse", {
    layersFolderName: "diademe me atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "7 diademe.jpg",
    finalImageFile: "10 diademe.jpg",
    template: "attique",
    price60x200: 27600,
  }),
  fromArchive("maison-e", {
    layersFolderName: "maison e me atike",
    categorySlug: "maison-toitu-terrasse",
    defaultImageFile: "4 Maison E.jpg",
    finalImageFile: "5 Maison E.jpg",
    template: "attique",
    price60x200: 22500,
  }),
  fromArchive("medialuna", {
    layersFolderName: "medialuna me atike",
    categorySlug: "maison-plein-pied",
    defaultImageFile: "7 medialuna.jpg",
    finalImageFile: "10 medialuna.jpg",
    template: "attique",
    preservePricingOnUpdate: true,
    price60x200: 30105,
  }),
  fromArchive("escape-villa-avec-attique", {
    legacySlugs: ["escape-villa-me-atike"],
    layersFolderName: "escape villa me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 ESCAPE VILLA.jpg",
    finalImageFile: "10 ESCAPE VILLA.jpg",
    template: "attique",
    price60x200: 31000,
  }),
  fromArchive("maison-2-etages-avec-attique", {
    legacySlugs: ["maison-2-etage-me-atike"],
    layersFolderName: "maison 2 etage me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "maison 2 me atike 7.jpg",
    finalImageFile: "maison 2 me atike 10.jpg",
    template: "attique",
    fileMappingExtras: {
      "8. lesh xhami.png": {
        field: "iso_ext_fibre",
        mediaType: "material_layer",
        alt: "Isolation fibre Maison 2 étages",
      },
    },
    price60x200: 34500,
  }),
  fromArchive("australe", {
    layersFolderName: "Australe",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "australe 7.jpg",
    finalImageFile: "australe 10.jpg",
    template: "attique",
    preservePricingOnUpdate: true,
    price60x200: 43000,
  }),
  fromArchive("elegance-comble", {
    layersFolderName: "Elegance Comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "elegance comble 7.jpg",
    finalImageFile: "elegance comble 5.jpg",
    template: "comble",
    preservePricingOnUpdate: true,
    price60x200: 30000,
  }),
  fromArchive("france-comble", {
    layersFolderName: "France comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "france comble 7.jpg",
    finalImageFile: "france comble 5.jpg",
    template: "comble",
    price60x200: 30500,
  }),
  fromArchive("cristal", {
    layersFolderName: "cristal comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "cristal comble 7.jpg",
    finalImageFile: "cristal comble 10.jpg",
    template: "comble",
    fileMappingExtras: {
      "cristal comble 7.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: "Cristal — 60×160",
      },
      "cristal comble 10.jpg": {
        field: "finalImage",
        mediaType: "final_render",
        alt: "Cristal — 60×200",
      },
    },
    price60x200: 38943,
  }),
  fromArchive("dianne", {
    title: "Dianne Comble",
    layersFolderName: "Dianne Comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "dianne comble 7.jpg",
    finalImageFile: "dianne comble 10.jpg",
    template: "comble",
    price60x200: 28175,
  }),
  fromArchive("els-house-comble", {
    layersFolderName: "Els House comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "els house 7.jpg",
    finalImageFile: "els house 10.jpg",
    template: "comble",
    price60x200: 29500,
  }),
  fromArchive("mountain-valley-villa-comble", {
    layersFolderName: "mountain valley villa comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "Mountain Valley Villa 7.jpg",
    finalImageFile: "Mountain Valley Villa 10.jpg",
    template: "comble",
    price60x200: 31500,
  }),
  fromArchive("nina-house", {
    title: "Nina comble",
    layersFolderName: "nina comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "nina 7.jpg",
    finalImageFile: "nina 10.jpg",
    template: "comble",
    price60x200: 28363,
  }),
  fromArchive("orenda", {
    title: "Orenda comble",
    layersFolderName: "orenda comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "orenda 7.jpg",
    finalImageFile: "orenda 10.jpg",
    template: "comble",
    preservePricingOnUpdate: true,
    price60x200: 34050,
  }),
  {
    slug: "azura-comble",
    title: "Azura Comble",
    layersFolderName: "Azura comble",
    categorySlug: "maison-combles-ammenageable",
    defaultImageFile: "azura 7.jpg",
    finalImageFile: "azura 10.jpg",
    template: "comble",
    price60x160: 1,
    price60x200: 1,
    description:
      "Le modèle Azura Comble allie charme traditionnel et performance énergétique avec combles aménageables.",
  },
  {
    slug: "monna-avec-attique",
    legacySlugs: ["monna-me-atike"],
    title: "Monna avec Attique",
    layersFolderName: "monna me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 monna.jpg",
    finalImageFile: "10 monna.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "marinela-avec-attique",
    legacySlugs: ["marinela-me-atike"],
    title: "Marinela avec Attique",
    layersFolderName: "marinela me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 marinela me atike.jpg",
    finalImageFile: "10 marinela me atike.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "melodie-avec-attique",
    legacySlugs: ["melodie-me-atike"],
    title: "Mélodie avec Attique",
    layersFolderName: "melodie me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 melodie.jpg",
    finalImageFile: "10 melodie.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "palma-etage-avec-attique",
    legacySlugs: ["palma-etage-me-atike"],
    title: "Palma étage avec Attique",
    layersFolderName: "Palma etage me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "australe 7.jpg",
    finalImageFile: "palma 10.jpg",
    template: "attique",
    fileMappingExtras: {
      "9. folia dhe listelat.png": {
        field: "couverture_pare_pluie_lattage",
        mediaType: "material_layer",
        alt: "Pare-pluie Palma étage",
      },
    },
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "regence-avec-attique",
    legacySlugs: ["regence-me-atike"],
    title: "Régence avec Attique",
    layersFolderName: "regence me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "regence 7.jpg",
    finalImageFile: "regence 10.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "sira-avec-attique",
    legacySlugs: ["sira-me-atike"],
    title: "Sira avec Attique",
    layersFolderName: "sira me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 sira house.jpg",
    finalImageFile: "10 sira house.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
  {
    slug: "symphonie-avec-attique",
    legacySlugs: ["symphonie-me-atike"],
    title: "Symphonie avec Attique",
    layersFolderName: "symphonie me atike",
    categorySlug: "maison-sans-faitage",
    defaultImageFile: "7 symphonie.jpg",
    finalImageFile: "10 symphonie.jpg",
    template: "attique",
    price60x160: 1,
    price60x200: 1,
  },
];
