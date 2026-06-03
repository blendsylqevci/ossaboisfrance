import type { HouseImportConfig } from "@/lib/house-import";
import { mergeAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  ATTIQUE_TERRASSE_ENABLE_FLAGS,
  ATTIQUE_TERRASSE_REQUIRED_LAYERS,
  DEFAULT_STRUCTURE_INFO_FR,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const TITLE = "France etage avec Attique";

export const franceEtageAvecAttiqueImportConfig: HouseImportConfig = {
  logLabel: "Import France etage avec Attique",
  layersFolderName: "France etage me atike",
  slug: "france-etage-avec-attique",
  categorySlug: "maison-sans-faitage",
  defaultImageFile: "France atike 7.jpg",
  finalImageFile: "France atike 10.jpg",
  requiredLayerFields: [...ATTIQUE_TERRASSE_REQUIRED_LAYERS],
  fileMapping: mergeAttiqueMapping(TITLE, {
    "France atike 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${TITLE} — 60×160`,
    },
    "France atike 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${TITLE} — 60×200`,
    },
  }),
  buildHousePayload: (categoryId) => ({
    title: TITLE,
    category: categoryId,
    subheading:
      "Le modèle France etage avec Attique allie architecture contemporaine et performance énergétique.",
    description:
      "Le modèle France etage avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique. Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 1,
    price60x200: 1,
    enableFlags: { ...ATTIQUE_TERRASSE_ENABLE_FLAGS },
    perdhesa: { ...PLACEHOLDER_PERDHESA, neto: 1 },
    windows: { ...PLACEHOLDER_WINDOWS },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
