import type { HouseImportConfig } from "@/lib/house-import";
import { mergeAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  ATTIQUE_TERRASSE_ENABLE_FLAGS,
  ATTIQUE_TERRASSE_REQUIRED_LAYERS,
  DEFAULT_STRUCTURE_INFO_FR,
} from "@/lib/house-import-shared";

const TITLE = "Enea avec Attique";

export const eneaAvecAttiqueImportConfig: HouseImportConfig = {
  logLabel: "Import Enea avec Attique",
  layersFolderName: "enea me atike",
  slug: "enea-avec-attique",
  categorySlug: "maison-sans-faitage",
  defaultImageFile: "4 enea.jpg",
  finalImageFile: "5 enea.jpg",
  preservePricingOnUpdate: true,
  requiredLayerFields: [...ATTIQUE_TERRASSE_REQUIRED_LAYERS],
  fileMapping: mergeAttiqueMapping(TITLE, {
    "4 enea.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${TITLE} — 60×160`,
    },
    "5 enea.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${TITLE} — 60×200`,
    },
  }),
  buildHousePayload: (categoryId) => ({
    title: TITLE,
    category: categoryId,
    subheading:
      "Le modèle Enea avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.",
    description:
      "Le modèle Enea avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne. Bâtie sur une structure robuste en ossature bois à haute performance énergétique (conforme RE2020), cette maison modulaire contemporaine offre des volumes intérieurs baignés de lumière grâce à ses larges ouvertures.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 27850,
    price60x200: 29300,
    enableFlags: { ...ATTIQUE_TERRASSE_ENABLE_FLAGS },
    perdhesa: {
      bruto: 110.0,
      neto: 96.0,
      mure_te_jashtme: 130,
      mure_mbajtese: 30,
      mure_ndarese: 50,
      pllaka_e_kulmit: 145,
      pllaka_e_katit_0: 0,
      pllaka_e_katit_1: 0,
      pllaka_e_katit_2: 0,
      pllaka_e_katit: 0,
      kulmi: 0,
    },
    windows: {
      aluminiumPrice: 8850,
      pvcPrice: 6200,
    },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
