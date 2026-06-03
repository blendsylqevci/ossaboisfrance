import type { HouseImportConfig } from "@/lib/house-import";
import {
  DEFAULT_STRUCTURE_INFO_FR,
  FRANCE_KULM_ENABLE_FLAGS,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const ALT = "Enea avec Toit";

export const eneaMeKulmImportConfig: HouseImportConfig = {
  logLabel: "Import Enea me Kulm",
  layersFolderName: "maison enea me kulm",
  slug: "enea-avec-toit",
  categorySlug: "maison-plein-pied",
  defaultImageFile: "enea me kulm 7.jpg",
  finalImageFile: "enea me kulm 10.jpg",
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
    "8. fibta.png": {
      field: "iso_ext_fibre",
      mediaType: "material_layer",
      alt: `Isolation extérieure fibre de bois ${ALT}`,
    },
    "8. fibra.png": {
      field: "iso_ext_fibre",
      mediaType: "material_layer",
      alt: `Isolation extérieure fibre de bois ${ALT}`,
    },
    "9. folia dhe listelat.png": {
      field: "couverture_pare_pluie_lattage",
      mediaType: "material_layer",
      alt: `Pare-pluie et lattage ${ALT}`,
    },
    "9. listelat dhe folia.png": {
      field: "couverture_pare_pluie_lattage",
      mediaType: "material_layer",
      alt: `Pare-pluie et lattage ${ALT}`,
    },
    "10 fasada e bardhe.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${ALT}`,
    },
    "10. fasada e bardhe.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${ALT}`,
    },
    "11. fasada arish.png": {
      field: "facade_bardage",
      mediaType: "material_layer",
      alt: `Façade bardage mélèze ${ALT}`,
    },
    "12 dritaret alumin.png": {
      field: "windows_aluminium",
      mediaType: "material_layer",
      alt: `Menuiseries aluminium ${ALT}`,
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
    "enea me kulm 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${ALT} — 60×160`,
    },
    "enea me kulm 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${ALT} — 60×200`,
    },
  },
  buildHousePayload: (categoryId) => ({
    title: ALT,
    category: categoryId,
    subheading:
      "Découvrez l'élégance moderne d'une maison de plain-pied d'exception à ossature bois, sublimée par une toiture traditionnelle à double pente. Le modèle Enea avec Toit allie confort thermique RE2020 et design contemporain personnalisable.",
    description:
      "Le modèle Enea avec Toit réinterprète le charme intemporel de la maison individuelle de plain-pied. Son architecture associe la convivialité d'un grand espace de vie ouvert à l'efficacité énergétique d'une isolation bois multicouche de pointe. Entièrement configurable, elle s'adapte à vos envies : choix des isolations, bardage en mélèze naturel, menuiseries premium et toiture en tuiles céramiques ou bac acier moderne. Grâce à une préfabrication soignée en atelier, Enea avec Toit permet une installation rapide sur site et des finitions extérieures personnalisables.",
    specification:
      "Maison à ossature bois de plain-pied avec toiture à pans inclinés. Couverture en tuiles ou bac acier sur pare-pluie et lattage inclus dans le prix de la structure.",
    price60x160: 1,
    price60x200: 1,
    enableFlags: { ...FRANCE_KULM_ENABLE_FLAGS },
    perdhesa: { ...PLACEHOLDER_PERDHESA },
    windows: { ...PLACEHOLDER_WINDOWS },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
