import { layerOrder } from "@/data/ambre";
import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const borealeLayers = {
  backgroundLayer: "https://ossaboisfrance.com/wp-content/uploads/2025/12/1.-Prapavija-scaled.png",
  constructionLayer: "https://ossaboisfrance.com/wp-content/uploads/2025/12/2.-kons-scaled.png",
  iso_inter_verre: "https://ossaboisfrance.com/wp-content/uploads/2025/12/3.-lesh-guri-scaled.png",
  iso_inter_roche: "https://ossaboisfrance.com/wp-content/uploads/2025/12/4.-lesh-druri-scaled.png",
  iso_inter_bois: "https://ossaboisfrance.com/wp-content/uploads/2025/12/5.-lesh-xhami-scaled.png",
  iso_ext_roche_comprimee: "https://ossaboisfrance.com/wp-content/uploads/2025/12/6.-stiropori-scaled.png",
  iso_ext_polystyrene: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7.-fibra-scaled.png",
  iso_ext_fibre: "https://ossaboisfrance.com/wp-content/uploads/2025/12/8.-lesh-guri-jashte-scaled.png",
  etancheite_epdm: "https://ossaboisfrance.com/wp-content/uploads/2025/12/10.-epdm-1-scaled.png",
  roof_roche: "https://ossaboisfrance.com/wp-content/uploads/2026/05/11.-fasada-e-bardhe-3-scaled.png",
  roof_verre: "https://ossaboisfrance.com/wp-content/uploads/2026/05/51B07EBE-8A28-46F2-A8A4-7A3F6E278D15.jpeg",
  faux_plafond_verre: "https://ossaboisfrance.com/wp-content/uploads/2026/05/51B07EBE-8A28-46F2-A8A4-7A3F6E278D15.jpeg",
  faux_plafond_roche: "https://ossaboisfrance.com/wp-content/uploads/2026/05/image.jpg",
  faux_plafond_bois: "https://ossaboisfrance.com/wp-content/uploads/2026/05/EMMY-7-scaled.jpg",
  facade_blanche: "https://ossaboisfrance.com/wp-content/uploads/2025/12/11.-fasada-e-bardhe-1-scaled.png",
  facade_bardage: "https://ossaboisfrance.com/wp-content/uploads/2025/12/12.-fasada-arish-1-scaled.png",
  windows_aluminium: "https://ossaboisfrance.com/wp-content/uploads/2025/12/13.-Dritaret-alumin-1-scaled.png",
  windows_pvc: "https://ossaboisfrance.com/wp-content/uploads/2025/12/14.-dritaret-pvc-1-scaled.png"
} as const;

const borealeDefaultImage = "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-boreale-scaled.jpg";

const borealeSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 27462,
    image: borealeDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 28962,
    image: borealeDefaultImage
  }
];

const borealeCategories: ConfigCategory[] = [
  {
    id: "isolation",
    inputName: "house_isolation",
    label: "Isolation intermediaire",
    description: "Choix de l'isolation entre les elements de structure.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "laine-verre",
        label: "Laine de verre",
        price160: 9.32,
        price200: 11.67,
        layerKey: "iso_inter_verre",
        layer: borealeLayers.iso_inter_verre
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 11.29,
        price200: 14.06,
        layerKey: "iso_inter_roche",
        layer: borealeLayers.iso_inter_roche
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 23.58,
        price200: 26.86,
        layerKey: "iso_inter_bois",
        layer: borealeLayers.iso_inter_bois
      }
    ]
  },
  {
    id: "outerIsolation",
    inputName: "house_outer_isolation",
    label: "Isolation exterieure",
    description: "Isolation appliquee depuis l'exterieur.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "laine-roche-ext",
        label: "Laine de roche compressee",
        price160: 11.19,
        layerKey: "iso_ext_roche_comprimee",
        layer: borealeLayers.iso_ext_roche_comprimee
      },
      {
        id: "polystyrene-graphite",
        label: "Polystyrene Graphite",
        price160: 9.98,
        layerKey: "iso_ext_polystyrene",
        layer: borealeLayers.iso_ext_polystyrene
      },
      {
        id: "fibre-bois",
        label: "Fibre de Bois",
        price160: 28.23,
        layerKey: "iso_ext_fibre",
        layer: borealeLayers.iso_ext_fibre
      }
    ]
  },
  {
    id: "facade",
    inputName: "house_facade",
    label: "Revetement exterieur",
    description: "Finition visible de la facade.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "crepis",
        label: "Facade Crepis",
        price160: 35,
        layerKey: "facade_blanche",
        layer: borealeLayers.facade_blanche
      },
      {
        id: "bardage-meleze",
        label: "Facade Bardage Bois Meleze",
        price160: 45,
        layerKey: "facade_bardage",
        layer: borealeLayers.facade_bardage
      }
    ]
  },
  {
    id: "etancheite",
    inputName: "house_etancheite",
    label: "Etancheite / Pare-pluie",
    description: "Protection et etancheite de la toiture.",
    priceMode: "roof_m2",
    selectionMode: "checkbox",
    options: [
      {
        id: "film-pare-pluie",
        label: "Film pare-pluie avec tasseau",
        price160: 85,
        layerKey: "etancheite_epdm",
        layer: borealeLayers.etancheite_epdm
      }
    ]
  },
  {
    id: "roof",
    inputName: "house_struktura_plloqes",
    label: "Isolation de la toiture par l'exterieur",
    description: "Isolation appliquee sur la toiture.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "roof-verre-220",
        label: "Laine de Verre - 220mm",
        price160: 11.67,
        layerKey: "roof_verre",
        layer: borealeLayers.roof_verre
      },
      {
        id: "roof-roche-220",
        label: "Laine de Roche - 220mm",
        price160: 14.06,
        layerKey: "roof_roche",
        layer: borealeLayers.roof_roche
      }
    ]
  },
  {
    id: "fauxPlafond",
    inputName: "house_izolimi_plloqes",
    label: "Faux plafond",
    description: "Isolation et finition du faux plafond.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "faux-verre",
        label: "Laine de Verre",
        price160: 8.9,
        price200: 11.15,
        layerKey: "faux_plafond_verre",
        layer: borealeLayers.faux_plafond_verre
      },
      {
        id: "faux-roche",
        label: "Laine de Roche",
        price160: 10.8,
        price200: 13.45,
        layerKey: "faux_plafond_roche",
        layer: borealeLayers.faux_plafond_roche
      },
      {
        id: "faux-bois",
        label: "Laine de Bois",
        price160: 22.55,
        price200: 25.7,
        layerKey: "faux_plafond_bois",
        layer: borealeLayers.faux_plafond_bois
      }
    ]
  },
  {
    id: "dritaret",
    inputName: "house_dritaret",
    label: "Menuiseries exterieures",
    description: "Type de fenetres et portes exterieures.",
    priceMode: "fixed",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "aluminium",
        label: "Aluminium",
        price160: 0,
        price200: 0,
        layerKey: "windows_aluminium",
        layer: borealeLayers.windows_aluminium
      },
      {
        id: "pvc",
        label: "PVC",
        price160: 0,
        price200: 0,
        layerKey: "windows_pvc",
        layer: borealeLayers.windows_pvc
      }
    ]
  }
];

export const borealeConfiguratorData: HouseConfiguratorData = {
  id: "boreale",
  name: "Boreale Toiture Terrasse",
  category: "Maison Toiture Terrasse",
  subheading:
    "BOREALE est une maison modulaire de plain-pied a ossature bois, sans toiture inclinee, offrant un design contemporain, epure et parfaitement fonctionnel.",
  description:
    "BOREALE est une maison modulaire contemporaine de plain-pied, concue avec une ossature bois robuste et une architecture epuree. Ce modele permet de tester le flow complet du configurateur avec isolation interieure, isolation exterieure, facade, etancheite, isolation toiture, faux plafond et menuiseries.",
  specification:
    "Donnees importees depuis WordPress/ACF et verifiees sur la page live. Couverture n'est pas affichee pour ce modele parce qu'aucun layer `couverture_*` n'est present dans les donnees confirmees.",
  defaultImage: borealeDefaultImage,
  finalImage: borealeDefaultImage,
  backgroundLayer: borealeLayers.backgroundLayer,
  constructionLayer: borealeLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 124.8,
    neto: 109,
    mure_te_jashtme: 167,
    mure_mbajtese: 41,
    mure_ndarese: 63,
    pllaka_e_kulmit: 122
  },
  sizes: borealeSizes,
  categories: borealeCategories,
  layerOrder,
  defaultSelection: {
    size: "60x160"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: true,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: false,
    enableCouvertureOption: false,
    enableFauxPlafondOption: true
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale."
};
