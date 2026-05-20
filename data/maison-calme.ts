import { ambreCategories, layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const maisonCalmeLayers = {
  backgroundLayer: "https://ossaboisfrance.com/wp-content/uploads/2025/12/1.-prapavija-2-scaled.png",
  constructionLayer: "https://ossaboisfrance.com/wp-content/uploads/2025/12/2.-kons-2-scaled.png",
  iso_inter_verre: "https://ossaboisfrance.com/wp-content/uploads/2025/12/3.-lesh-guri-2-scaled.png",
  iso_inter_roche: "https://ossaboisfrance.com/wp-content/uploads/2025/12/4.-lesh-druri-2-scaled.png",
  iso_inter_bois: "https://ossaboisfrance.com/wp-content/uploads/2025/12/5.-lesh-xhami-2-scaled.png",
  iso_ext_roche_comprimee: "https://ossaboisfrance.com/wp-content/uploads/2025/12/6.-stiropori-2-scaled.png",
  iso_ext_polystyrene: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7.-lesh-guri-jashte-scaled.png",
  iso_ext_fibre: "https://ossaboisfrance.com/wp-content/uploads/2025/12/8.-fibra-scaled.png",
  etancheite_epdm: "https://ossaboisfrance.com/wp-content/uploads/2025/12/10.-epdm-scaled.png",
  facade_blanche: "https://ossaboisfrance.com/wp-content/uploads/2025/12/11.-fasada-e-bardhe-scaled.png",
  facade_bardage: "https://ossaboisfrance.com/wp-content/uploads/2025/12/12.-fasada-arish-scaled.png",
  windows_aluminium: "https://ossaboisfrance.com/wp-content/uploads/2025/12/13.-dritare-alumin-scaled.png",
  windows_pvc: "https://ossaboisfrance.com/wp-content/uploads/2025/12/14.-dritare-pvc-scaled.png"
} as const;

const maisonCalmeSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 43808.8,
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg"
  },
  {
    id: "60x200",
    label: "60x200",
    price: 45908.8,
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg"
  }
];

const maisonCalmeCategories: ConfigCategory[] = ambreCategories.map((category) => ({
  ...category,
  options: category.options
    .filter((option) => option.layerKey in maisonCalmeLayers)
    .map((option) => {
      const layer = maisonCalmeLayers[option.layerKey as keyof typeof maisonCalmeLayers];
      const isAluminium = option.layerKey === "windows_aluminium";
      const isPvc = option.layerKey === "windows_pvc";

      return {
        ...option,
        price160: isAluminium ? 7564 : isPvc ? 6176 : option.price160,
        price200: isAluminium ? 7564 : isPvc ? 6176 : option.price200,
        layer
      };
    })
}));

export const maisonCalmeConfiguratorData: HouseConfiguratorData = {
  id: "maison-calme",
  name: "Maison Calme Toiture Terrasse",
  category: "Maison Toiture Terrasse",
  subheading:
    "Maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste avec toiture terrasse.",
  description:
    "MAISON CALME est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste garantissant stabilité, durabilité et excellente performance thermique. Avec une surface brute de 132,07 m², ce modèle propose des espaces de vie généreux, lumineux et parfaitement organisés.",
  specification:
    "Données importées depuis WordPress/ACF. Les options affichées suivent les layer keys confirmés pour Maison Calme Toiture Terrasse.",
  defaultImage: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg",
  finalImage: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg",
  backgroundLayer: maisonCalmeLayers.backgroundLayer,
  constructionLayer: maisonCalmeLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 132.07,
    neto: 115.8,
    mure_te_jashtme: 203,
    mure_mbajtese: 36,
    mure_ndarese: 55,
    pllaka_e_kulmit: 132
  },
  sizes: maisonCalmeSizes,
  categories: maisonCalmeCategories,
  layerOrder,
  defaultSelection: {
    size: "60x160"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: false,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: false,
    enableCouvertureOption: false,
    enableFauxPlafondOption: false
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale."
};
