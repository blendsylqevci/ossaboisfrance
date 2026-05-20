import { layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const asebraKulmLayers = {
  backgroundLayer: "/images/houses/asebra me kulm/1. prapavija.png",
  constructionLayer: "/images/houses/asebra me kulm/2. kons.png",
  iso_inter_verre: "/images/houses/asebra me kulm/5. lesh xhami.png",
  iso_inter_roche: "/images/houses/asebra me kulm/3. LESHGURI.png",
  iso_inter_bois: "/images/houses/asebra me kulm/4. lesh druri.png",
  iso_ext_roche_comprimee: "/images/houses/asebra me kulm/7. lesh guri jashte.png",
  iso_ext_polystyrene: "/images/houses/asebra me kulm/6. stiropori.png",
  iso_ext_fibre: "/images/houses/asebra me kulm/8. fibra.png",
  etancheite_epdm: "/images/houses/asebra me kulm/9. folia dhe listelat.png",
  facade_blanche: "/images/houses/asebra me kulm/10. fasada e bardhe.png",
  facade_bardage: "/images/houses/asebra me kulm/11. fasada arish.png",
  windows_aluminium: "/images/houses/asebra me kulm/12. dritaret alumin.png",
  windows_pvc: "/images/houses/asebra me kulm/13. dritaret pvc.png",
  couverture_tuiles_gouttieres: "/images/houses/asebra me kulm/14. qeramika.png",
  couverture_bac_acier_gouttieres: "/images/houses/asebra me kulm/15.a llamarina.png"
} as const;

const asebraKulmDefaultImage = "/images/houses/asebra me kulm/asebra me kulm 7.jpg";
const asebraKulmFinalImage = "/images/houses/asebra me kulm/asebra me kulm 10.jpg";

const asebraKulmSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 40170.20, // 28,693 * 1.40
    image: asebraKulmDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 42270.20, // 30,193 * 1.40
    image: asebraKulmFinalImage
  }
];

const asebraKulmCategories: ConfigCategory[] = [
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
        layer: asebraKulmLayers.iso_inter_verre
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 12.5,
        price200: 14.0,
        layerKey: "iso_inter_roche",
        layer: asebraKulmLayers.iso_inter_roche
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18.0,
        layerKey: "iso_inter_bois",
        layer: asebraKulmLayers.iso_inter_bois
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
        layer: asebraKulmLayers.iso_ext_roche_comprimee
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrène",
        price160: 10.15,
        layerKey: "iso_ext_polystyrene",
        layer: asebraKulmLayers.iso_ext_polystyrene
      },
      {
        id: "fibre",
        label: "Fibre de bois",
        price160: 14.2,
        layerKey: "iso_ext_fibre",
        layer: asebraKulmLayers.iso_ext_fibre
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
        layer: asebraKulmLayers.facade_blanche
      },
      {
        id: "bardage",
        label: "Bardage bois / Mélèze",
        price160: 45.0,
        layerKey: "facade_bardage",
        layer: asebraKulmLayers.facade_bardage
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
        layer: asebraKulmLayers.etancheite_epdm
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
        layer: asebraKulmLayers.couverture_tuiles_gouttieres
      },
      {
        id: "bac-acier",
        label: "Couverture Bac Acier (Tôle)",
        price160: 32.0,
        price200: 35.0,
        layerKey: "couverture_bac_acier_gouttieres",
        layer: asebraKulmLayers.couverture_bac_acier_gouttieres
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
        price160: 7331,
        price200: 7331,
        layerKey: "windows_aluminium",
        layer: asebraKulmLayers.windows_aluminium
      },
      {
        id: "pvc",
        label: "Menuiseries PVC",
        price160: 5778,
        price200: 5778,
        layerKey: "windows_pvc",
        layer: asebraKulmLayers.windows_pvc
      }
    ]
  }
];

export const asebraKulmConfiguratorData: HouseConfiguratorData = {
  id: "asebra-me-kulm",
  name: "Asebra avec Toit",
  category: "Maison plain pied",
  subheading: "Découvrez l'élégance intemporelle d'une maison de plain-pied à ossature bois haut de gamme, couronnée d'une magnifique toiture traditionnelle à double pente. Alliant design contemporain, volumes ouverts et haute performance thermique conforme RE2020, le modèle Asebra avec Toit offre un cadre de vie exceptionnel et durable, entièrement configurable.",
  description:
    "Le modèle Asebra avec Toit allie les espaces de vie spacieux et ouverts de plain-pied de la gamme Asebra au charme intemporel d'une toiture à double pente. Cette conception offre une allure classique tout en bénéficiant de notre technologie moderne d'ossature bois et d'une performance énergétique de premier plan (conforme RE2020).",
  specification:
    "Configuration complète pour la maison à ossature bois Asebra avec Toit. La toiture inclinée comprend des options de tuiles en céramique ou de bac acier.",
  defaultImage: asebraKulmDefaultImage,
  finalImage: asebraKulmFinalImage,
  backgroundLayer: asebraKulmLayers.backgroundLayer,
  constructionLayer: asebraKulmLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 117.86,
    neto: 103.6,
    mure_te_jashtme: 125,
    mure_mbajtese: 24,
    mure_ndarese: 74,
    pllaka_e_kulmit: 163
  },
  sizes: asebraKulmSizes,
  categories: asebraKulmCategories,
  layerOrder,
  defaultSelection: {
    size: "60x160"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: true,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: false,
    enableCouvertureOption: true,
    enableFauxPlafondOption: false
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation, solivage et charpente à fermettes. Le prix inclut le transport et le montage sous garantie décennale."
};
