import { ambreCategories, layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const asebraLayers = {
  backgroundLayer: "https://ossaboisfrance.com/wp-content/uploads/2026/04/1.-Prapavija-scaled.png",
  constructionLayer: "https://ossaboisfrance.com/wp-content/uploads/2026/04/2.-kons-scaled.png",
  iso_inter_verre: "https://ossaboisfrance.com/wp-content/uploads/2026/04/3.-lesh-guri-scaled.png",
  iso_inter_roche: "https://ossaboisfrance.com/wp-content/uploads/2026/04/4.-lesh-druri-scaled.png",
  iso_inter_bois: "https://ossaboisfrance.com/wp-content/uploads/2026/04/5.-lesh-xhami-scaled.png",
  iso_ext_roche_comprimee: "https://ossaboisfrance.com/wp-content/uploads/2026/04/6.-stiropori-scaled.png",
  iso_ext_polystyrene: "https://ossaboisfrance.com/wp-content/uploads/2026/04/7.-fibra-scaled.png",
  iso_ext_fibre: "https://ossaboisfrance.com/wp-content/uploads/2026/04/8.-leshi-gurit-jashte-scaled.png",
  etancheite_epdm: "https://ossaboisfrance.com/wp-content/uploads/2026/04/10.-epdm-1-scaled.png",
  facade_blanche: "https://ossaboisfrance.com/wp-content/uploads/2026/04/11.-fasada-e-bardhe-1-scaled.png",
  facade_bardage: "https://ossaboisfrance.com/wp-content/uploads/2026/04/12.-fasada-arish-1-scaled.png",
  windows_aluminium: "https://ossaboisfrance.com/wp-content/uploads/2026/04/13.-dritaret-alumin-1-scaled.png",
  windows_pvc: "https://ossaboisfrance.com/wp-content/uploads/2026/04/14.-dritaret-pvc-1-scaled.png"
} as const;

const asebraDefaultImage = "https://ossaboisfrance.com/wp-content/uploads/2026/04/5-asebra-scaled.jpg";

const asebraSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 40170.2,
    image: asebraDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 42270.2,
    image: asebraDefaultImage
  }
];

const asebraCategories: ConfigCategory[] = ambreCategories.map((category) => ({
  ...category,
  options: category.options
    .filter((option) => option.layerKey in asebraLayers)
    .map((option) => {
      const layer = asebraLayers[option.layerKey as keyof typeof asebraLayers];
      const isAluminium = option.layerKey === "windows_aluminium";
      const isPvc = option.layerKey === "windows_pvc";

      return {
        ...option,
        price160: isAluminium ? 7331 : isPvc ? 5778 : option.price160,
        price200: isAluminium ? 7331 : isPvc ? 5778 : option.price200,
        layer
      };
    })
}));

export const asebraConfiguratorData: HouseConfiguratorData = {
  id: "asebra",
  name: "ASEBRA Toiture Terrasse",
  category: "Maison Toiture Terrasse",
  subheading: "ASEBRA Toiture Terrasse - Une architecture moderne pensee pour une vie elegante et apaisante.",
  description:
    "Le modele ASEBRA Toiture Terrasse seduit par son design contemporain, ses volumes harmonieux et son esthetique minimaliste inspiree de l'architecture moderne europeenne. Concue pour offrir confort, luminosite et fonctionnalite, cette maison a toiture terrasse propose des espaces ouverts et accueillants, parfaitement adaptes a un mode de vie moderne et raffine.",
  specification:
    "Donnees importees depuis WordPress/ACF. Pour ce modele, la surface EPDM utilise `perdhesa_kulmi` car `perdhesa_pllaka_e_kulmit` est vide dans l'export WordPress.",
  defaultImage: asebraDefaultImage,
  finalImage: asebraDefaultImage,
  backgroundLayer: asebraLayers.backgroundLayer,
  constructionLayer: asebraLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 117.86,
    neto: 103.6,
    mure_te_jashtme: 125,
    mure_mbajtese: 24,
    mure_ndarese: 74,
    pllaka_e_kulmit: 163
  },
  sizes: asebraSizes,
  categories: asebraCategories,
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
