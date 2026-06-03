import type { HouseImportConfig } from "@/lib/house-import";
import {
  DEFAULT_STRUCTURE_INFO_FR,
  FRANCE_KULM_ENABLE_FLAGS,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const ALT = "Emeraude me Kulm";

export const emeraudeMeKulmImportConfig: HouseImportConfig = {
  logLabel: "Import Emeraude me Kulm",
  layersFolderName: "emeraude me kulm",
  slug: "emeraude-me-kulm",
  categorySlug: "maison-plein-pied",
  defaultImageFile: "Emeraude me kulm 7.jpg",
  finalImageFile: "Emeraude me kulm 10.jpg",
  requiredLayerFields: [
    "backgroundLayer",
    "constructionLayer",
    "couverture_pare_pluie_lattage",
    "couverture_tuiles_gouttieres",
    "couverture_bac_acier_gouttieres",
  ],
  fileMapping: {
    "1. prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${ALT}`,
    },
    "2. kons.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${ALT}`,
    },
    "3. lesh guri.png": {
      field: "iso_inter_roche",
      mediaType: "material_layer",
      alt: `Isolation laine de roche ${ALT}`,
    },
    "4. lesh druri.png": {
      field: "iso_inter_bois",
      mediaType: "material_layer",
      alt: `Isolation laine de bois ${ALT}`,
    },
    "5. lesh xhami.png": {
      field: "iso_inter_verre",
      mediaType: "material_layer",
      alt: `Isolation laine de verre ${ALT}`,
    },
    "6. STIROPORI.png": {
      field: "iso_ext_polystyrene",
      mediaType: "material_layer",
      alt: `Isolation extérieure polystyrène ${ALT}`,
    },
    "6. stiropori.png": {
      field: "iso_ext_polystyrene",
      mediaType: "material_layer",
      alt: `Isolation extérieure polystyrène ${ALT}`,
    },
    "7. lesh guri jashte.png": {
      field: "iso_ext_roche_comprimee",
      mediaType: "material_layer",
      alt: `Isolation extérieure laine de roche ${ALT}`,
    },
    "8. fibra.png": {
      field: "iso_ext_fibre",
      mediaType: "material_layer",
      alt: `Isolation extérieure fibre de bois ${ALT}`,
    },
    "9. listelat dhe folia.png": {
      field: "couverture_pare_pluie_lattage",
      mediaType: "material_layer",
      alt: `Pare-pluie et lattage ${ALT}`,
    },
    "9. folia dhe listelat.png": {
      field: "couverture_pare_pluie_lattage",
      mediaType: "material_layer",
      alt: `Pare-pluie et lattage ${ALT}`,
    },
    "10. fasada e bardhe.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${ALT}`,
    },
    "10. mfasada e bardhe.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${ALT}`,
    },
    "11. fasada arish.png": {
      field: "facade_bardage",
      mediaType: "material_layer",
      alt: `Façade bardage mélèze ${ALT}`,
    },
    "12. dritaret alumin.png": {
      field: "windows_aluminium",
      mediaType: "material_layer",
      alt: `Menuiseries aluminium ${ALT}`,
    },
    "13. dritaret pvc.png": {
      field: "windows_pvc",
      mediaType: "material_layer",
      alt: `Menuiseries PVC ${ALT}`,
    },
    "14. qeremidet.png": {
      field: "couverture_tuiles_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture tuiles ${ALT}`,
    },
    "15. llamarina.png": {
      field: "couverture_bac_acier_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture bac acier ${ALT}`,
    },
    "15a. llamarina.png": {
      field: "couverture_bac_acier_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture bac acier ${ALT}`,
    },
    "15.a llamarina.png": {
      field: "couverture_bac_acier_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture bac acier ${ALT}`,
    },
    "Emeraude me kulm 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${ALT} — 60×160`,
    },
    "Emeraude me kulm 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${ALT} — 60×200`,
    },
  },
  buildHousePayload: (categoryId) => ({
    title: ALT,
    category: categoryId,
    subheading:
      "ÉMERAUDE avec toiture est une maison modulaire de plain-pied à ossature bois, au plan en L, dotée d'une toiture inclinée élégante et performante.",
    description:
      "ÉMERAUDE avec toiture est une maison modulaire contemporaine de plain-pied, au plan en L, construite sur une ossature bois robuste garantissant durabilité, stabilité et excellente performance thermique. Sa toiture inclinée assure une protection efficace contre les intempéries et confère à la maison une esthétique harmonieuse et intemporelle. Les volumes généreux et la distribution fonctionnelle en L offrent des espaces de vie lumineux, adaptés à une résidence principale ou à un projet familial. Grâce à une préfabrication soignée en atelier, ÉMERAUDE permet une installation rapide sur site, une qualité constante et des finitions extérieures personnalisables telles que le bardage bois naturel, l'enduit moderne ou les panneaux composites. Élégante, confortable et performante, cette maison constitue un choix durable pour un habitat contemporain.",
    specification: "Fiche technique disponible sur demande.",
    price60x160: 1,
    price60x200: 1,
    enableFlags: { ...FRANCE_KULM_ENABLE_FLAGS },
    perdhesa: { ...PLACEHOLDER_PERDHESA },
    windows: { ...PLACEHOLDER_WINDOWS },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
