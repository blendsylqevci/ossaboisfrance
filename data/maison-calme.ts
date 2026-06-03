import { ambreCategories, layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const CALME = "/images/houses/calme-atike";

const maisonCalmeLayers = {
  backgroundLayer: `${CALME}/1-prapavija.png`,
  constructionLayer: `${CALME}/2-kons.png`,
  iso_inter_roche: `${CALME}/3-lesh-guri.png`,
  iso_inter_bois: `${CALME}/4-lesh-druri.png`,
  iso_inter_verre: `${CALME}/5-lesh-xhami.png`,
  iso_ext_polystyrene: `${CALME}/6-stiropori.png`,
  iso_ext_roche_comprimee: `${CALME}/7-lesh-guri-jashte.png`,
  iso_ext_fibre: `${CALME}/8-fibra.png`,
  terrace_etancheite_epdm: `${CALME}/9-stiropori-atikes.png`,
  etancheite_epdm: `${CALME}/10-epdm.png`,
  facade_blanche: `${CALME}/11-fasada-e-bardhe.png`,
  facade_bardage: `${CALME}/12-fasada-arish.png`,
  windows_aluminium: `${CALME}/13-dritare-alumin.png`,
  windows_pvc: `${CALME}/14-dritare-pvc.png`,
} as const;

const maisonCalmeSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 31292,
    image: `${CALME}/7 CALME.jpg`,
  },
  {
    id: "60x200",
    label: "60x200",
    price: 32792,
    image: `${CALME}/10 CALME.jpg`,
  },
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
        layer,
      };
    }),
}));

export const maisonCalmeConfiguratorData: HouseConfiguratorData = {
  id: "maison-calme",
  name: "Maison Calme Toiture Terrasse",
  category: "Maison Toiture Terrasse",
  subheading:
    "Maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste avec toiture terrasse.",
  description:
    "MAISON CALME est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste garantissant stabilité, durabilité et excellente performance thermique. Avec une surface brute de 132,07 m², ce modèle propose des espaces de vie généreux, lumineux et parfaitement organisés.",
  specification: "Maison à toiture terrasse — sources locales `public/images/houses/calme-atike/`.",
  defaultImage: `${CALME}/7 CALME.jpg`,
  finalImage: `${CALME}/10 CALME.jpg`,
  backgroundLayer: maisonCalmeLayers.backgroundLayer,
  constructionLayer: maisonCalmeLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 132.07,
    neto: 115.8,
    mure_te_jashtme: 145,
    mure_mbajtese: 30,
    mure_ndarese: 65,
    pllaka_e_kulmit: 122,
    kulmi: 0,
  },
  sizes: maisonCalmeSizes,
  categories: maisonCalmeCategories,
  layerOrder: layerOrder.filter((key) => key in maisonCalmeLayers),
  defaultSelection: {
    size: "60x160",
    etancheite: "epdm",
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: false,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: true,
    enableCouvertureOption: false,
    enableFauxPlafondOption: false,
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Le prix inclut le transport et le montage sur site sous garantie décennale.",
};
