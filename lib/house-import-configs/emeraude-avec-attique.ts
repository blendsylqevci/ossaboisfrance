import type { HouseImportConfig } from "@/lib/house-import";
import { mergeAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  ATTIQUE_TERRASSE_ENABLE_FLAGS,
  ATTIQUE_TERRASSE_REQUIRED_LAYERS,
  DEFAULT_STRUCTURE_INFO_FR,
} from "@/lib/house-import-shared";

const TITLE = "Emeraude avec Attique";

export const emeraudeAvecAttiqueImportConfig: HouseImportConfig = {
  logLabel: "Import Emeraude avec Attique",
  layersFolderName: "emeraude me atike",
  slug: "emeraude-avec-attique",
  legacySlug: "emeraude-toiture-terrasse",
  categorySlug: "maison-sans-faitage",
  defaultImageFile: "7 EMERAUDE.jpg",
  finalImageFile: "10 EMERAUDE.jpg",
  preservePricingOnUpdate: true,
  requiredLayerFields: [...ATTIQUE_TERRASSE_REQUIRED_LAYERS],
  fileMapping: mergeAttiqueMapping(TITLE, {
    "7 EMERAUDE.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${TITLE} — 60×160`,
    },
    "10 EMERAUDE.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${TITLE} — 60×200`,
    },
  }),
  buildHousePayload: (categoryId) => ({
    title: TITLE,
    category: categoryId,
    subheading: "Le modèle Emeraude avec Attique — toiture terrasse et performance RE2020.",
    description:
      "Le modèle Emeraude avec Attique associe volumes contemporains, attique fonctionnel et ossature bois haute performance thermique.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 28800,
    price60x200: 30300,
    enableFlags: { ...ATTIQUE_TERRASSE_ENABLE_FLAGS },
    perdhesa: {
      bruto: 114.7,
      neto: 98.4,
      mure_te_jashtme: 147.2,
      mure_mbajtese: 28.5,
      mure_ndarese: 55.4,
      pllaka_e_kulmit: 122.5,
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
