import type { HouseImportConfig } from "@/lib/house-import";
import { mergeAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  ATTIQUE_TERRASSE_ENABLE_FLAGS,
  ATTIQUE_TERRASSE_REQUIRED_LAYERS,
  DEFAULT_STRUCTURE_INFO_FR,
} from "@/lib/house-import-shared";

const TITLE = "Emmy avec Attique";

export const maisonEmmyImportConfig: HouseImportConfig = {
  logLabel: "Import Emmy avec Attique",
  layersFolderName: "emmy house etage me atike",
  slug: "maison-emmy",
  categorySlug: "maison-sans-faitage",
  defaultImageFile: "EMMY 7.jpg",
  finalImageFile: "EMMY 10.jpg",
  preservePricingOnUpdate: true,
  requiredLayerFields: [...ATTIQUE_TERRASSE_REQUIRED_LAYERS],
  fileMapping: mergeAttiqueMapping(TITLE, {
    "EMMY 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${TITLE} — 60×160`,
    },
    "EMMY 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${TITLE} — 60×200`,
    },
  }),
  buildHousePayload: (categoryId) => ({
    title: TITLE,
    category: categoryId,
    subheading: "Le modèle Emmy avec Attique — volumes généreux et toiture terrasse.",
    description:
      "Le modèle Emmy avec Attique offre une architecture contemporaine à toiture plate, attique et ossature bois performante.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 37157,
    price60x200: 38657,
    enableFlags: { ...ATTIQUE_TERRASSE_ENABLE_FLAGS },
    perdhesa: {
      bruto: 170.59,
      neto: 134.55,
      mure_te_jashtme: 290,
      mure_mbajtese: 58,
      mure_ndarese: 50,
      pllaka_e_kulmit: 98,
      pllaka_e_katit_0: 0,
      pllaka_e_katit_1: 0,
      pllaka_e_katit_2: 0,
      pllaka_e_katit: 98,
      kulmi: 0,
    },
    windows: {
      aluminiumPrice: 12913,
      pvcPrice: 7585,
    },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
