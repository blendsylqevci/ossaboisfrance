import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const asebraLayerOrder = [
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

const asebraLayers = {
  backgroundLayer: "/images/houses/asebra me atike/1. Prapavija.png",
  constructionLayer: "/images/houses/asebra me atike/2. kons.png",
  iso_inter_verre: "/images/houses/asebra me atike/5. lesh xhami.png",
  iso_inter_roche: "/images/houses/asebra me atike/3. lesh guri.png",
  iso_inter_bois: "/images/houses/asebra me atike/4. lesh druri.png",
  iso_ext_roche_comprimee: "/images/houses/asebra me atike/8. leshi gurit jashte.png",
  iso_ext_polystyrene: "/images/houses/asebra me atike/6. stiropori.png",
  iso_ext_fibre: "/images/houses/asebra me atike/7. fibra.png",
  terrace_etancheite_epdm: "/images/houses/asebra me atike/9. stiropori atikes.png",
  etancheite_epdm: "/images/houses/asebra me atike/10. epdm.png",
  facade_blanche: "/images/houses/asebra me atike/11. fasada e bardhe.png",
  facade_bardage: "/images/houses/asebra me atike/12. fasada arish.png",
  windows_aluminium: "/images/houses/asebra me atike/13. dritaret alumin.png",
  windows_pvc: "/images/houses/asebra me atike/14. dritaret pvc.png"
} as const;

const asebraDefaultImage = "/images/houses/asebra me atike/4 asebra.jpg";
const asebraFinalImage = "/images/houses/asebra me atike/5 asebra.jpg";

const asebraSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 28693,
    image: asebraDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 30193,
    image: asebraFinalImage
  }
];

const asebraCategories: ConfigCategory[] = [
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
        layer: asebraLayers.iso_inter_verre,
        materialDescription: "Solution d'isolation légère et efficace pour les parois de la structure."
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 12.5,
        price200: 14.0,
        layerKey: "iso_inter_roche",
        layer: asebraLayers.iso_inter_roche,
        materialDescription: "Isolation minérale avec une bonne tenue thermique et acoustique."
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18.0,
        layerKey: "iso_inter_bois",
        layer: asebraLayers.iso_inter_bois,
        materialDescription: "Isolation biosourcée, choisie pour le confort thermique et l'inertie naturelle."
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
        price200: 17.4,
        layerKey: "iso_ext_roche_comprimee",
        layer: asebraLayers.iso_ext_roche_comprimee,
        materialDescription: "Isolation extérieure dense en laine de roche comprimée, robuste et stable."
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrene",
        price160: 10.15,
        price200: 11.4,
        layerKey: "iso_ext_polystyrene",
        layer: asebraLayers.iso_ext_polystyrene,
        materialDescription: "Isolation extérieure en polystyrène pour une enveloppe continue et un coût maîtrisé."
      },
      {
        id: "fibre",
        label: "Fibre",
        price160: 14.2,
        price200: 15.6,
        layerKey: "iso_ext_fibre",
        layer: asebraLayers.iso_ext_fibre,
        materialDescription: "Isolation extérieure biosourcée haute densité en fibre de bois."
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
        layer: asebraLayers.terrace_etancheite_epdm,
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
        layer: asebraLayers.etancheite_epdm,
        materialDescription: "Membrane synthétique monocouche offrant une étanchéité totale et durable."
      }
    ]
  },
  {
    id: "facade",
    inputName: "house_facade",
    label: "Finition façade",
    description: "Revêtement extérieur de la maison.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "blanc",
        label: "Enduit blanc",
        price160: 0,
        price200: 0,
        layerKey: "facade_blanche",
        layer: asebraLayers.facade_blanche,
        materialDescription: "Finition enduit blanc traditionnel."
      },
      {
        id: "bardage",
        label: "Bardage bois mélèze",
        price160: 16.9,
        price200: 18.5,
        layerKey: "facade_bardage",
        layer: asebraLayers.facade_bardage,
        materialDescription: "Clin de bardage en bois de mélèze naturel."
      }
    ]
  },
  {
    id: "dritaret",
    inputName: "house_dritaret",
    label: "Menuiseries extérieures",
    description: "Fenêtres et portes extérieures.",
    priceMode: "fixed",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "aluminium",
        label: "Menuiseries Aluminium",
        price160: 7331,
        price200: 7331,
        layerKey: "windows_aluminium",
        layer: asebraLayers.windows_aluminium,
        materialDescription: "Menuiseries en aluminium thermolaqué de couleur anthracite."
      },
      {
        id: "pvc",
        label: "Menuiseries PVC",
        price160: 5778,
        price200: 5778,
        layerKey: "windows_pvc",
        layer: asebraLayers.windows_pvc,
        materialDescription: "Menuiseries PVC haute performance d'isolation."
      }
    ]
  }
];

export const asebraConfiguratorData: HouseConfiguratorData = {
  id: "asebra-me-atike",
  name: "Asebra avec Attique",
  category: "Maison toiture terrasse avec étage",
  categorySlug: "maison-sans-faitage",
  subheading: "Découvrez le modèle Asebra avec Attique, une réalisation modulaire d'exception dotée d'une architecture plate contemporaine et d'une structure bois performante.",
  description: "Le modèle Asebra avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020). Cette maison modulaire haut de gamme propose un toit plat avec attique, créant des lignes géométriques épurées qui s'intègrent à la perfection dans les environnements urbains et résidentiels modernes. Entièrement personnalisable, elle allie confort et élégance architecturale.",
  specification: "Fiche technique de l'Asebra avec Attique. Toiture plate avec isolation d'attique en polystyrène et membrane d'étanchéité EPDM.",
  defaultImage: asebraDefaultImage,
  finalImage: asebraFinalImage,
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
  layerOrder: asebraLayerOrder,
  defaultSelection: {},
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: false,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: true,
    enableCouvertureOption: false,
    enableFauxPlafondOption: false
  },
  structureInfo: "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle de type terrasse avec attique. Le transport et le montage sont en supplément et sont calculés séparément lors de la validation du projet."
};
