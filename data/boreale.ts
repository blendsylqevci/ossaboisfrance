import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const borealeLayerOrder = [
  "konstruksioni",
  "iso_inter_verre",
  "iso_inter_roche",
  "iso_inter_bois",
  "iso_ext_roche_comprimee",
  "iso_ext_polystyrene",
  "iso_ext_fibre",
  "terrace_etancheite_epdm",
  "etancheite_epdm",
  "facade_blanche",
  "facade_bardage",
  "windows_aluminium",
  "windows_pvc"
] as const;

const borealeLayers = {
  backgroundLayer: "/images/houses/Boreale me atike/1. Prapavija.png",
  constructionLayer: "/images/houses/Boreale me atike/2. kons.png",
  iso_inter_roche: "/images/houses/Boreale me atike/3. lesh guri.png",
  iso_inter_bois: "/images/houses/Boreale me atike/4. lesh druri.png",
  iso_inter_verre: "/images/houses/Boreale me atike/5. lesh xhami.png",
  iso_ext_polystyrene: "/images/houses/Boreale me atike/6. stiropori.png",
  iso_ext_fibre: "/images/houses/Boreale me atike/7. fibra.png",
  iso_ext_roche_comprimee: "/images/houses/Boreale me atike/8. lesh guri jashte.png",
  terrace_etancheite_epdm: "/images/houses/Boreale me atike/9. stiropori atikes.png",
  etancheite_epdm: "/images/houses/Boreale me atike/10. epdm.png",
  facade_blanche: "/images/houses/Boreale me atike/11. fasada e bardhe.png",
  facade_bardage: "/images/houses/Boreale me atike/12. fasada arish.png",
  windows_aluminium: "/images/houses/Boreale me atike/13. Dritaret alumin.png",
  windows_pvc: "/images/houses/Boreale me atike/14. dritaret pvc.png"
} as const;

const borealeDefaultImage = "/images/houses/Boreale me atike/7 boreale.jpg";
const borealeFinalImage = "/images/houses/Boreale me atike/10 boreale.jpg";

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
        layer: borealeLayers.iso_inter_verre,
        materialDescription: "Isolation standard performante avec de la laine de verre."
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 11.29,
        price200: 14.06,
        layerKey: "iso_inter_roche",
        layer: borealeLayers.iso_inter_roche,
        materialDescription: "Excellente isolation thermique et acoustique, naturellement résistante au feu."
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 23.58,
        price200: 26.86,
        layerKey: "iso_inter_bois",
        layer: borealeLayers.iso_inter_bois,
        materialDescription: "Matériau écologique offrant un excellent confort d'été grâce à son inertie."
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
        layer: borealeLayers.iso_ext_roche_comprimee,
        materialDescription: "Isolation extérieure dense en laine de roche comprimée."
      },
      {
        id: "polystyrene-graphite",
        label: "Polystyrene Graphite",
        price160: 9.98,
        layerKey: "iso_ext_polystyrene",
        layer: borealeLayers.iso_ext_polystyrene,
        materialDescription: "Isolation extérieure en polystyrène graphite à haut pouvoir isolant."
      },
      {
        id: "fibre-bois",
        label: "Fibre de Bois",
        price160: 28.23,
        layerKey: "iso_ext_fibre",
        layer: borealeLayers.iso_ext_fibre,
        materialDescription: "Isolation extérieure biosourcée en fibre de bois haute densité."
      }
    ]
  },
  {
    id: "terraceEtancheite",
    inputName: "house_terrace_etancheite",
    label: "Isolation toiture terrasse",
    description: "Isolation pour toiture terrasse.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "attic-polystyrene",
        label: "Polystyrène en pente",
        price160: 15.5,
        price200: 17.0,
        layerKey: "terrace_etancheite_epdm",
        layer: borealeLayers.terrace_etancheite_epdm,
        materialDescription: "Couche de polystyrène isolant sur l'attique."
      }
    ]
  },
  {
    id: "etancheite",
    inputName: "house_etancheite",
    label: "Étanchéité",
    description: "Membrane d'étanchéité pour la toiture terrasse.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "epdm",
        label: "Membrane EPDM",
        price160: 25.9,
        price200: 27.5,
        layerKey: "etancheite_epdm",
        layer: borealeLayers.etancheite_epdm,
        materialDescription: "Membrane synthétique monocouche offrant une étanchéité totale et durable."
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
        layer: borealeLayers.facade_blanche,
        materialDescription: "Finition enduit blanc traditionnel."
      },
      {
        id: "bardage-meleze",
        label: "Facade Bardage Bois Meleze",
        price160: 45,
        layerKey: "facade_bardage",
        layer: borealeLayers.facade_bardage,
        materialDescription: "Clin de bardage en bois de mélèze naturel."
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
        price160: 7564,
        price200: 7564,
        layerKey: "windows_aluminium",
        layer: borealeLayers.windows_aluminium,
        materialDescription: "Menuiseries en aluminium thermolaqué de couleur anthracite."
      },
      {
        id: "pvc",
        label: "PVC",
        price160: 6176,
        price200: 6176,
        layerKey: "windows_pvc",
        layer: borealeLayers.windows_pvc,
        materialDescription: "Menuiseries PVC haute performance d'isolation."
      }
    ]
  }
];

export const borealeConfiguratorData: HouseConfiguratorData = {
  id: "boreale-me-atike",
  name: "Boreale avec Attique",
  category: "Maison toiture terrasse avec étage",
  subheading:
    "Découvrez le modèle Boreale avec Attique, une réalisation modulaire d’exception dotée d’une architecture plate contemporaine et d’une structure bois performante.",
  description:
    "Le modèle Boreale avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020). Cette maison modulaire haut de gamme propose un toit plat avec attique, créant des lignes géométriques épurées qui s’intègrent à la perfection dans les environnements urbains et résidentiels modernes. Entièrement personnalisable, elle allie confort et élégance architecturale.",
  specification:
    "Fiche technique de la Boreale avec Attique. Toiture plate avec isolation d'attique en polystyrène et membrane d'étanchéité EPDM.",
  defaultImage: borealeDefaultImage,
  finalImage: borealeFinalImage,
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
  layerOrder: borealeLayerOrder,
  defaultSelection: {
    size: "60x160"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: false,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: true,
    enableCouvertureOption: false,
    enableFauxPlafondOption: false
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle de type terrasse avec attique. Le prix inclut le transport et le montage sur site sous garantie décennale."
};
