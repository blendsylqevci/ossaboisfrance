import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

export const layerOrder = [
  "konstruksioni",
  "iso_inter_verre",
  "iso_inter_roche",
  "iso_inter_bois",
  "iso_ext_roche_comprimee",
  "iso_ext_polystyrene",
  "iso_ext_fibre",
  "etancheite_epdm",
  "roof_polystyrene",
  "roof_roche",
  "roof_verre",
  "couverture_pare_pluie_lattage",
  "couverture_tuiles_gouttieres",
  "couverture_bac_acier_gouttieres",
  "terrace_etancheite_epdm",
  "faux_plafond_verre",
  "faux_plafond_roche",
  "faux_plafond_bois",
  "facade_blanche",
  "facade_bardage",
  "windows_aluminium",
  "windows_pvc"
] as const;

export const ambreHouse = {
  id: "ambre",
  name: "Ambre",
  category: "Maison a toiture terrasse",
  subheading:
    "Maison modulaire contemporaine de plain-pied, concue avec une ossature bois robuste et une finition configurable.",
  description:
    "AMBRE est une maison modulaire contemporaine de plain-pied. Le configurateur permet de composer la structure, les isolations, la facade, l'etancheite et les menuiseries, puis de transmettre une demande complete.",
  specification:
    "Structure en ossature bois selon les normes en vigueur. Les surfaces et options ci-dessous servent au calcul de prix live et seront reprises dans la demande envoyee par email.",
  defaultImage: "/images/houses/ambre/7 ambre.jpg",
  finalImage: "/images/houses/ambre/10 ambre.jpg",
  backgroundLayer: "/images/houses/ambre/1. Prapavija.png",
  constructionLayer: "/images/houses/ambre/2. kons.png",
  marginPercent: 40,
  perdhesa: {
    bruto: 110,
    neto: 96,
    mure_te_jashtme: 148,
    mure_mbajtese: 64,
    mure_ndarese: 38,
    pllaka_e_kulmit: 112
  },
  sizes: [
    {
      id: "60x160",
      label: "60x160",
      price: 36379,
      image: "/images/houses/ambre/7 ambre.jpg"
    },
    {
      id: "60x200",
      label: "60x200",
      price: 42180,
      image: "/images/houses/ambre/10 ambre.jpg"
    }
  ] satisfies SizeOption[]
};

export const ambreCategories: ConfigCategory[] = [
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
        price160: 11.15,
        price200: 12.25,
        layerKey: "iso_inter_verre",
        layer: "/images/houses/ambre/3. lesh guri.png",
        materialDescription:
          "Solution d'isolation legere et efficace pour les parois intermediaires de la structure."
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 12.5,
        price200: 14,
        layerKey: "iso_inter_roche",
        layer: "/images/houses/ambre/4. lesh druri.png",
        materialDescription:
          "Isolation minerale avec une bonne tenue thermique et acoustique, adaptee aux murs de l'ossature bois."
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18,
        layerKey: "iso_inter_bois",
        layer: "/images/houses/ambre/5. lesh xhami.png",
        materialDescription:
          "Isolation biosourcee, choisie pour le confort thermique, l'inertie et une finition plus naturelle."
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
        label: "Laine de roche comprimee",
        price160: 15.9,
        price200: 17.4,
        layerKey: "iso_ext_roche_comprimee",
        layer: "/images/houses/ambre/6. stiropori.png",
        materialDescription:
          "Isolation exterieure dense en laine de roche comprimee, robuste et stable sur la facade."
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrene",
        price160: 10.15,
        price200: 11.4,
        layerKey: "iso_ext_polystyrene",
        layer: "/images/houses/ambre/7. fibra.png",
        materialDescription:
          "Isolation exterieure en polystyrene pour une enveloppe continue et un cout maitrise."
      },
      {
        id: "fibre",
        label: "Fibre",
        price160: 14.2,
        price200: 15.6,
        layerKey: "iso_ext_fibre",
        layer: "/images/houses/ambre/8. lesh guri i jashtem.png",
        materialDescription:
          "Couche d'isolation exterieure en fibre pour ameliorer la performance de l'enveloppe."
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
        id: "blanc",
        label: "Facade blanche",
        price160: 0,
        price200: 0,
        layerKey: "facade_blanche",
        layer: "/images/houses/ambre/11. fasada e bardhe.png",
        materialDescription:
          "Finition de facade blanche, appliquee apres validation des isolations necessaires."
      },
      {
        id: "bardage",
        label: "Bardage bois",
        price160: 16.9,
        price200: 18.5,
        layerKey: "facade_bardage",
        layer: "/images/houses/ambre/12. fasada arish.png",
        materialDescription:
          "Bardage bois exterieur pour une finition chaleureuse et naturelle."
      }
    ]
  },
  {
    id: "etancheite",
    inputName: "house_etancheite",
    label: "Etancheite / Pare-pluie",
    description: "Protection et etancheite de la toiture terrasse.",
    priceMode: "roof_m2",
    selectionMode: "checkbox",
    options: [
      {
        id: "epdm",
        label: "EPDM",
        price160: 25.9,
        price200: 27.5,
        layerKey: "etancheite_epdm",
        layer: "/images/houses/ambre/10.epdm.png",
        materialDescription:
          "Membrane EPDM pour l'etancheite de la toiture terrasse, calculee sur la surface de toiture."
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
        price160: 3800,
        price200: 3800,
        layerKey: "windows_aluminium",
        layer: "/images/houses/ambre/13. dritaret alumin.png",
        materialDescription:
          "Menuiseries aluminium avec finition contemporaine et bonne rigidite."
      },
      {
        id: "pvc",
        label: "PVC",
        price160: 2700,
        price200: 2700,
        layerKey: "windows_pvc",
        layer: "/images/houses/ambre/14 dritaret pvc.png",
        materialDescription:
          "Menuiseries PVC, solution economique avec de bonnes performances thermiques."
      }
    ]
  }
];

export const defaultAmbreSelection = {
  size: "60x160"
} as Record<string, string>;

export const ambreConfiguratorData: HouseConfiguratorData = {
  ...ambreHouse,
  categories: ambreCategories,
  layerOrder,
  defaultSelection: defaultAmbreSelection,
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
