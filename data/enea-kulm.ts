import { layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const eneaKulmLayers = {
  backgroundLayer: "/images/houses/maison enea me kulm/1. prapavija.png",
  constructionLayer: "/images/houses/maison enea me kulm/2. kons.png",
  iso_inter_verre: "/images/houses/maison enea me kulm/5. lesh xhami.png",
  iso_inter_roche: "/images/houses/maison enea me kulm/3. lesh guri.png",
  iso_inter_bois: "/images/houses/maison enea me kulm/4. lesh druri.png",
  iso_ext_roche_comprimee: "/images/houses/maison enea me kulm/7. lesh guri jashte.png",
  iso_ext_polystyrene: "/images/houses/maison enea me kulm/6. stiropori.png",
  iso_ext_fibre: "/images/houses/maison enea me kulm/8. fibta.png",
  etancheite_epdm: "/images/houses/maison enea me kulm/9. folia dhe listelat.png",
  facade_blanche: "/images/houses/maison enea me kulm/10 fasada e bardhe.png",
  facade_bardage: "/images/houses/maison enea me kulm/11. fasada arish.png",
  windows_aluminium: "/images/houses/maison enea me kulm/12 dritaret alumin.png",
  windows_pvc: "/images/houses/maison enea me kulm/13. dritaret pvc.png",
  couverture_tuiles_gouttieres: "/images/houses/maison enea me kulm/14. qeremidet.png",
  couverture_bac_acier_gouttieres: "/images/houses/maison enea me kulm/15. llamarina.png"
} as const;

const eneaKulmDefaultImage = "/images/houses/maison enea me kulm/enea me kulm 7.jpg";
const eneaKulmFinalImage = "/images/houses/maison enea me kulm/enea me kulm 10.jpg";

const eneaKulmSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 27850, // raw base price, will show 38,990 with 40% margin
    image: eneaKulmDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 29300, // raw base price, will show 41,020 with 40% margin
    image: eneaKulmFinalImage
  }
];

const eneaKulmCategories: ConfigCategory[] = [
  {
    id: "isolation",
    inputName: "house_isolation",
    label: "Isolation intermédiaire",
    description: "Choix de l'isolation entre les éléments de structure.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "laine-verre",
        label: "Laine de verre",
        price160: 11.15,
        price200: 12.25,
        layerKey: "iso_inter_verre",
        layer: eneaKulmLayers.iso_inter_verre
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 12.5,
        price200: 14.0,
        layerKey: "iso_inter_roche",
        layer: eneaKulmLayers.iso_inter_roche
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18.0,
        layerKey: "iso_inter_bois",
        layer: eneaKulmLayers.iso_inter_bois
      }
    ]
  },
  {
    id: "outerIsolation",
    inputName: "house_outer_isolation",
    label: "Isolation extérieure",
    description: "Isolation appliquée depuis l'extérieur.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "laine-roche-ext",
        label: "Laine de roche comprimée",
        price160: 15.9,
        layerKey: "iso_ext_roche_comprimee",
        layer: eneaKulmLayers.iso_ext_roche_comprimee
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrène",
        price160: 10.15,
        layerKey: "iso_ext_polystyrene",
        layer: eneaKulmLayers.iso_ext_polystyrene
      },
      {
        id: "fibre",
        label: "Fibre de bois",
        price160: 14.2,
        layerKey: "iso_ext_fibre",
        layer: eneaKulmLayers.iso_ext_fibre
      }
    ]
  },
  {
    id: "facade",
    inputName: "house_facade",
    label: "Revêtement extérieur / Façade",
    description: "Finition visible de la façade.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "blanc",
        label: "Enduit blanc",
        price160: 35.0,
        layerKey: "facade_blanche",
        layer: eneaKulmLayers.facade_blanche
      },
      {
        id: "bardage",
        label: "Bardage bois / Mélèze",
        price160: 45.0,
        layerKey: "facade_bardage",
        layer: eneaKulmLayers.facade_bardage
      }
    ]
  },
  {
    id: "etancheite",
    inputName: "house_etancheite",
    label: "Pare-pluie sous toiture",
    description: "Protection et étanchéité sous couverture.",
    priceMode: "roof_m2",
    selectionMode: "checkbox",
    options: [
      {
        id: "pare-pluie",
        label: "Folia et listelat pare-pluie",
        price160: 25.9,
        price200: 27.5,
        layerKey: "etancheite_epdm",
        layer: eneaKulmLayers.etancheite_epdm
      }
    ]
  },
  {
    id: "couverture",
    inputName: "house_toiture",
    label: "Couverture de toit",
    description: "Type de couverture et finitions de toiture.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "tuiles",
        label: "Couverture Tuiles (Céramique)",
        price160: 28.5,
        price200: 31.0,
        layerKey: "couverture_tuiles_gouttieres",
        layer: eneaKulmLayers.couverture_tuiles_gouttieres
      },
      {
        id: "bac-acier",
        label: "Couverture Bac Acier (Tôle)",
        price160: 32.0,
        price200: 35.0,
        layerKey: "couverture_bac_acier_gouttieres",
        layer: eneaKulmLayers.couverture_bac_acier_gouttieres
      }
    ]
  },
  {
    id: "dritaret",
    inputName: "house_dritaret",
    label: "Menuiseries extérieures",
    description: "Type de fenêtres et portes extérieures.",
    priceMode: "fixed",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "aluminium",
        label: "Menuiseries Aluminium",
        price160: 0, // placeholder empty
        price200: 0, // placeholder empty
        layerKey: "windows_aluminium",
        layer: eneaKulmLayers.windows_aluminium
      },
      {
        id: "pvc",
        label: "Menuiseries PVC",
        price160: 0, // placeholder empty
        price200: 0, // placeholder empty
        layerKey: "windows_pvc",
        layer: eneaKulmLayers.windows_pvc
      }
    ]
  }
];

export const eneaKulmConfiguratorData: HouseConfiguratorData = {
  id: "maison-enea-me-kulm",
  name: "Enea avec Toit",
  category: "Maison plain pied",
  categorySlug: "maison-plein-pied",
  subheading: "Découvrez l'élégance moderne d'une maison de plain-pied d'exception à ossature bois, sublimée par une toiture traditionnelle à double pente. Conçue pour offrir des espaces intérieurs fluides et inondés de lumière, le modèle Enea avec Toit allie confort thermique RE2020 et design contemporain personnalisable.",
  description:
    "Le modèle Enea avec Toit réinterprète le charme intemporel de la maison individuelle de plain-pied. Son architecture associe la convivialité d'un grand espace de vie ouvert à l'efficacité énergétique d'une isolation bois multicouche de pointe. Entièrement configurable, elle s'adapte à vos envies : choix des isolations, bardage en mélèze naturel, menuiseries premium et toiture en tuiles céramiques ou bac acier moderne.",
  specification:
    "Spécifications complètes pour la maison à ossature bois Maison Enea avec Toit. La toiture à pans inclinés supporte des couvertures en tuiles céramiques ou en bac acier.",
  defaultImage: eneaKulmDefaultImage,
  finalImage: eneaKulmFinalImage,
  backgroundLayer: eneaKulmLayers.backgroundLayer,
  constructionLayer: eneaKulmLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 110.0,
    neto: 96.0,
    mure_te_jashtme: 130,
    mure_mbajtese: 30,
    mure_ndarese: 50,
    pllaka_e_kulmit: 145
  },
  sizes: eneaKulmSizes,
  categories: eneaKulmCategories,
  layerOrder,
  defaultSelection: {},
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: true,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: false,
    enableCouvertureOption: true,
    enableFauxPlafondOption: false
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Le transport et le montage sont en supplément et sont calculés séparément lors de la validation du projet."
};
