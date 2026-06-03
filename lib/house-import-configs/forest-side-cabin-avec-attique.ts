import type { HouseImportConfig } from "@/lib/house-import";
import { forestSideCabinAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  DEFAULT_STRUCTURE_INFO_FR,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const TITLE = "Forest Side Cabin avec Attique";
const DEFAULT_IMG = "forest side cabin atike 7.jpg";
const FINAL_IMG = "forest side cabin atike 10.jpg";

export const forestSideCabinAvecAttiqueImportConfig: HouseImportConfig = {
  logLabel: "Import Forest Side Cabin avec Attique",
  layersFolderName: "forest side cabin me atike",
  slug: "forest-side-cabin-avec-attique",
  categorySlug: "maison-sans-faitage",
  defaultImageFile: DEFAULT_IMG,
  finalImageFile: FINAL_IMG,
  requiredLayerFields: ["backgroundLayer", "constructionLayer", "etancheite_epdm"],
  fileMapping: forestSideCabinAttiqueMapping(TITLE, DEFAULT_IMG, FINAL_IMG),
  buildHousePayload: (categoryId) => ({
    title: TITLE,
    category: categoryId,
    subheading:
      "Le modèle Forest Side Cabin avec Attique allie architecture contemporaine et performance énergétique.",
    description:
      "Le modèle Forest Side Cabin avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique. Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 1,
    price60x200: 1,
    enableFlags: {
      enableRoofOption: false,
      enableEtancheiteOption: true,
      enableEtancheiteTerrasse: false,
      enableCouvertureOption: false,
      enableFauxPlafondOption: false,
    },
    perdhesa: { ...PLACEHOLDER_PERDHESA, neto: 1 },
    windows: { ...PLACEHOLDER_WINDOWS },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
