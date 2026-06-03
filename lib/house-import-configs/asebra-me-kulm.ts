import type { HouseImportConfig } from "@/lib/house-import";
import {
  DEFAULT_STRUCTURE_INFO_FR,
  FRANCE_KULM_ENABLE_FLAGS,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";

const ALT = "Asebra avec Toit";

export const asebraMeKulmImportConfig: HouseImportConfig = {
  logLabel: "Import Asebra me Kulm",
  layersFolderName: "asebra me kulm",
  slug: "asebra-avec-toit",
  categorySlug: "maison-plein-pied",
  defaultImageFile: "asebra me kulm 7.jpg",
  finalImageFile: "asebra me kulm 10.jpg",
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
    "3. LESHGURI.png": {
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
    "14. qeremidet.png": {
      field: "couverture_tuiles_gouttieres",
      mediaType: "material_layer",
      alt: `Couverture tuiles ${ALT}`,
    },
    "14. qeramika.png": {
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
    "asebra me kulm 7.jpg": {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${ALT} — 60×160`,
    },
    "asebra me kulm 10.jpg": {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${ALT} — 60×200`,
    },
  },
  buildHousePayload: (categoryId) => ({
    title: ALT,
    category: categoryId,
    subheading:
      "ASEBRA avec toiture est une maison modulaire de plain-pied à ossature bois, dotée d'une toiture inclinée, offrant un style chaleureux, équilibré et performant.",
    description:
      "Le modèle Asebra avec Toit allie les espaces de vie spacieux et ouverts de plain-pied de la gamme Asebra au charme intemporel d'une toiture à double pente. Construite sur une ossature bois robuste garantissant durabilité, stabilité et excellente performance thermique, cette maison modulaire contemporaine permet une installation rapide sur site et des finitions extérieures personnalisables. Fonctionnelle, lumineuse et élégante, elle est idéale pour une résidence principale ou un projet résidentiel durable.",
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
