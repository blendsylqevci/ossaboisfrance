import type { HouseImportConfig } from "@/lib/house-import";
import {
  DEFAULT_STRUCTURE_INFO_FR,
  FRANCE_KULM_ENABLE_FLAGS,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const ALT = "A Frame House me Kulm";

export const aFrameHouseMeKulmImportConfig: HouseImportConfig = {
  logLabel: "Import A Frame me Kulm",
  layersFolderName: "a frame house me kulm",
  slug: "a-frame-house-me-kulm",
  categorySlug: "maison-plein-pied",
  defaultImageFile: "a frame house me kulm 7.jpg",
  finalImageFile: "a frame house me kulm 10.jpg",
  requiredLayerFields: [
    "backgroundLayer",
    "constructionLayer",
    "couverture_pare_pluie_lattage",
    "couverture_tuiles_gouttieres",
    "couverture_bac_acier_gouttieres",
  ],
  fileMapping: {
    "1. Prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${ALT}`,
    },
    "2. kons.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${ALT}`,
    },
    "3. leshguri.png": {
      field: "iso_inter_roche",
      mediaType: "material_layer",
      alt: `Isolation laine de roche ${ALT}`,
    },
    "4. lesh druri.png": {
      field: "iso_inter_bois",
      mediaType: "material_layer",
      alt: `Isolation laine de bois ${ALT}`,
    },
    "5. lsh xhami.png": {
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
    "14. qeramika.png": {
      field: "couverture_tuiles_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture tuiles ${ALT}`,
    },
    "14. qeremidet.png": {
      field: "couverture_tuiles_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture tuiles ${ALT}`,
    },
    "15.a llamarina.png": {
      field: "couverture_bac_acier_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture bac acier ${ALT}`,
    },
    "15. llamarina.png": {
      field: "couverture_bac_acier_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture bac acier ${ALT}`,
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
    "a frame house me kulm 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${ALT} — 60×160`,
    },
    "a frame house me kulm 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${ALT} — 60×200`,
    },
  },
  buildHousePayload: (categoryId) => ({
    title: "A Frame House me Kulm",
    category: categoryId,
    subheading:
      "A Frame House avec toit est une maison modulaire élégante à ossature bois, offrant un design chaleureux et une performance thermique optimale.",
    description:
      "A Frame House avec toit est une maison modulaire moderne construite sur une ossature bois robuste, conçue pour offrir un confort exceptionnel en toutes saisons. Son toit incliné améliore l'évacuation des eaux pluviales, optimise l'isolation naturelle et donne à la maison une esthétique chaleureuse et intemporelle. Grâce à une préfabrication de haute précision, l'installation est rapide, durable et adaptable à différents types de finitions extérieures (bois naturel, panneaux composites, enduit moderne). Ce modèle combine élégance, efficacité énergétique et fonctionnalité, parfaitement adapté aux familles, résidences secondaires ou projets touristiques.",
    specification:
      "Maison à ossature bois de plain-pied avec toiture en A. Couverture en tuiles ou bac acier sur pare-pluie et lattage inclus dans le prix de la structure.",
    price60x160: 1,
    price60x200: 1,
    enableFlags: { ...FRANCE_KULM_ENABLE_FLAGS },
    perdhesa: { ...PLACEHOLDER_PERDHESA },
    windows: { ...PLACEHOLDER_WINDOWS },
    structureInfo: DEFAULT_STRUCTURE_INFO_FR,
  }),
};
