import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const eleganceCombleLayerOrder = [
  "konstruksioni",
  "iso_inter_verre",
  "iso_inter_bois",
  "iso_ext_roche_comprimee",
  "iso_ext_polystyrene",
  "iso_ext_fibre",
  "faux_plafond_verre",
  "faux_plafond_roche",
  "faux_plafond_bois",
  "roof_polystyrene",
  "roof_bois",
  "roof_roche",
  "roof_verre",
  "couverture_pare_pluie_lattage",
  "couverture_tuiles_gouttieres",
  "couverture_bac_acier_gouttieres",
  "facade_blanche",
  "facade_bardage",
  "windows_aluminium",
  "windows_pvc"
] as const;

const eleganceCombleLayers = {
  backgroundLayer: "/images/houses/Elegance Comble/1. prapavija.png",
  constructionLayer: "/images/houses/Elegance Comble/2. kons.png",
  iso_inter_verre: "/images/houses/Elegance Comble/5. lesh xhami.png",
  iso_inter_bois: "/images/houses/Elegance Comble/4. lesh druri.png",
  iso_ext_polystyrene: "/images/houses/Elegance Comble/9. stiropori.png",
  iso_ext_roche_comprimee: "/images/houses/Elegance Comble/10. lesh guri jashte.png",
  iso_ext_fibre: "/images/houses/Elegance Comble/11. fibra.png",
  roof_polystyrene: "/images/houses/Elegance Comble/3. izolimi kulmit.png",
  roof_roche: "/images/houses/Elegance Comble/6. lesh guri ne kulm.png",
  roof_bois: "/images/houses/Elegance Comble/7. lesh druri ne kulm.png",
  roof_verre: "/images/houses/Elegance Comble/8. lesh xhami.png",
  couverture_pare_pluie_lattage: "/images/houses/Elegance Comble/12. folia dhe listelat.png",
  facade_blanche: "/images/houses/Elegance Comble/13. fasada e bardhe.png",
  facade_bardage: "/images/houses/Elegance Comble/14. fasada arish.png",
  windows_aluminium: "/images/houses/Elegance Comble/15. dritaret alumin.png",
  windows_pvc: "/images/houses/Elegance Comble/16. dritaret pvc.png",
  couverture_tuiles_gouttieres: "/images/houses/Elegance Comble/17. qeremidet.png",
  couverture_bac_acier_gouttieres: "/images/houses/Elegance Comble/18. llamarina.png",
  faux_plafond_roche: "/images/houses/Elegance Comble/19. lesh guri ne pllake.png",
  faux_plafond_bois: "/images/houses/Elegance Comble/20. lesh druri ne pllake.png",
  faux_plafond_verre: "/images/houses/Elegance Comble/21. lesh xhami ne pllake.png"
} as const;

const eleganceCombleDefaultImage = "/images/houses/Elegance Comble/elegance comble 7.jpg";
const eleganceCombleFinalImage = "/images/houses/Elegance Comble/elegance comble 5.jpg";

const eleganceCombleSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 28500,
    image: eleganceCombleDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 30000,
    image: eleganceCombleDefaultImage
  }
];

const eleganceCombleCategories: ConfigCategory[] = [
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
        layer: eleganceCombleLayers.iso_inter_verre,
        materialDescription: "Solution d'isolation légère et efficace pour les parois de la structure."
      },
      {
        id: "laine-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18.0,
        layerKey: "iso_inter_bois",
        layer: eleganceCombleLayers.iso_inter_bois,
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
        layer: eleganceCombleLayers.iso_ext_roche_comprimee,
        materialDescription: "Isolation extérieure dense en laine de roche comprimée, robuste et stable."
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrene",
        price160: 10.15,
        price200: 11.4,
        layerKey: "iso_ext_polystyrene",
        layer: eleganceCombleLayers.iso_ext_polystyrene,
        materialDescription: "Isolation extérieure en polystyrène pour une enveloppe continue et un coût maîtrisé."
      },
      {
        id: "fibre",
        label: "Fibre",
        price160: 14.2,
        price200: 15.6,
        layerKey: "iso_ext_fibre",
        layer: eleganceCombleLayers.iso_ext_fibre,
        materialDescription: "Isolation extérieure biosourcée haute densité en fibre de bois."
      }
    ]
  },
  {
    id: "facade",
    inputName: "house_facade",
    label: "Finition de la façade",
    description: "Choisissez le revêtement extérieur de votre maison.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "enduit",
        label: "Façade blanche (Enduit)",
        price160: 25.5,
        price200: 25.5,
        layerKey: "facade_blanche",
        layer: eleganceCombleLayers.facade_blanche,
        materialDescription: "Finition par enduit blanc offrant un aspect propre, moderne et lumineux."
      },
      {
        id: "bardage",
        label: "Bardage Mélèze",
        price160: 38.5,
        price200: 38.5,
        layerKey: "facade_bardage",
        layer: eleganceCombleLayers.facade_bardage,
        materialDescription: "Finition par clin de bois en Mélèze naturel pour un look chaleureux et authentique."
      }
    ]
  },
  {
    id: "fauxPlafond",
    inputName: "house_faux_plafond",
    label: "Faux plafond",
    description: "Isolation acoustique et thermique des faux plafonds.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "verre",
        label: "Laine de Verre",
        price160: 8.9,
        price200: 11.15,
        layerKey: "faux_plafond_verre",
        layer: eleganceCombleLayers.faux_plafond_verre,
        materialDescription: "Isolation soufflée légère et thermiquement performante."
      },
      {
        id: "roche",
        label: "Laine de Roche",
        price160: 10.8,
        price200: 13.45,
        layerKey: "faux_plafond_roche",
        layer: eleganceCombleLayers.faux_plafond_roche,
        materialDescription: "Soufflage dense offrant d'excellentes qualités d'absorption acoustique."
      },
      {
        id: "bois",
        label: "Laine de Bois",
        price160: 22.55,
        price200: 25.7,
        layerKey: "faux_plafond_bois",
        layer: eleganceCombleLayers.faux_plafond_bois,
        materialDescription: "Fibre de bois soufflée naturelle, écologique et à fort pouvoir isolant."
      }
    ]
  },
  {
    id: "roof",
    inputName: "house_roof_isolation",
    label: "Isolation de la toiture par l'extérieur",
    description: "Isolation pour charpente fermette.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "polystyrene-toiture",
        label: "Polystyrène de toiture",
        price160: 14.0,
        price200: 14.0,
        layerKey: "roof_polystyrene",
        layer: eleganceCombleLayers.roof_polystyrene,
        materialDescription: "Isolation toiture en polystyrène expansé."
      },
      {
        id: "verre",
        label: "Laine de Verre - 220mm",
        price160: 11.67,
        price200: 11.67,
        layerKey: "roof_verre",
        layer: eleganceCombleLayers.roof_verre,
        materialDescription: "Laine de verre soufflée offrant une excellente barrière thermique homogène."
      },
      {
        id: "roche",
        label: "Laine de Roche - 220mm",
        price160: 14.06,
        price200: 14.06,
        layerKey: "roof_roche",
        layer: eleganceCombleLayers.roof_roche,
        materialDescription: "Isolation par soufflage de laine de roche stable, dense et résistante au feu."
      },
      {
        id: "bois",
        label: "Laine de Bois - 220mm",
        price160: 30.0,
        price200: 30.0,
        layerKey: "roof_bois",
        layer: eleganceCombleLayers.roof_bois,
        materialDescription: "Isolation rigide haute performance par plaques de fibre de bois."
      }
    ]
  },
  {
    id: "couverture",
    inputName: "house_couverture",
    label: "Couverture",
    description: "Matériaux de couverture pour toit incliné.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "pare-pluie",
        label: "Pare Pluie et Lattage",
        price160: 0,
        price200: 0,
        layerKey: "couverture_pare_pluie_lattage",
        layer: eleganceCombleLayers.couverture_pare_pluie_lattage,
        materialDescription: "Écran sous toiture HPV et contre-lattage assurant la ventilation."
      },
      {
        id: "tuiles",
        label: "Tuiles et Gouttières",
        price160: 70.0,
        price200: 70.0,
        layerKey: "couverture_tuiles_gouttieres",
        layer: eleganceCombleLayers.couverture_tuiles_gouttieres,
        materialDescription: "Tuiles béton ou terre cuite avec gouttières de récupération d'eau pluviale."
      },
      {
        id: "bac-acier",
        label: "Bac Acier et Gouttières",
        price160: 80.0,
        price200: 80.0,
        layerKey: "couverture_bac_acier_gouttieres",
        layer: eleganceCombleLayers.couverture_bac_acier_gouttieres,
        materialDescription: "Couverture sèche en tôle d'acier profilée très résistante aux intempéries."
      }
    ]
  },
  {
    id: "dritaret",
    inputName: "house_windows",
    label: "Menuiseries extérieures",
    description: "Choisissez les huisseries de votre maison (fenêtres et baies).",
    priceMode: "fixed",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "aluminium",
        label: "Menuiseries Aluminium",
        price160: 7564,
        price200: 7564,
        layerKey: "windows_aluminium",
        layer: eleganceCombleLayers.windows_aluminium,
        materialDescription: "Menuiseries en aluminium thermolaqué de couleur anthracite avec double vitrage performant."
      },
      {
        id: "pvc",
        label: "Menuiseries PVC",
        price160: 6176,
        price200: 6176,
        layerKey: "windows_pvc",
        layer: eleganceCombleLayers.windows_pvc,
        materialDescription: "Menuiseries PVC haute isolation offrant le meilleur rapport performance/prix."
      }
    ]
  }
];

export const eleganceCombleConfiguratorData: HouseConfiguratorData = {
  id: "elegance-comble",
  name: "Elegance Comble",
  category: "Maison combles amenageable",
  categorySlug: "maison-combles-ammenageable",
  subheading:
    "Découvrez Elegance Comble, un modèle de maison d'exception à combles aménageables avec une structure bois performante.",
  description:
    "Le modèle Elegance Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale pour s'adapter à l'évolution de votre famille. Sa structure robuste en ossature bois à haute efficacité thermique garantit un confort de vie inégalé en toutes saisons.",
  specification: "Maison moderne à combles aménageables.",
  defaultImage: eleganceCombleDefaultImage,
  finalImage: eleganceCombleFinalImage,
  backgroundLayer: eleganceCombleLayers.backgroundLayer,
  constructionLayer: eleganceCombleLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 135.5,
    neto: 118.2,
    mure_te_jashtme: 145,
    mure_mbajtese: 30,
    mure_ndarese: 65,
    pllaka_e_kulmit: 85,
    kulmi: 130
  },
  sizes: eleganceCombleSizes,
  categories: eleganceCombleCategories,
  layerOrder: eleganceCombleLayerOrder,
  defaultSelection: {
    couverture: "pare-pluie"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: true,
    enableEtancheiteOption: false,
    enableEtancheiteTerrasse: false,
    enableCouvertureOption: true,
    enableFauxPlafondOption: true
  },
  structureInfo:
    "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente bois de type combles aménageables. Le transport et le montage sont en supplément et sont calculés séparément lors de la validation du projet.",
  sliderConfig: {
    top: "10%",
    height: "55%",
    left: "15%",
    width: "80%",
    slantAngle: -40,
    slantOffset: -57.61,
    clippableOptions: ["pare-pluie", "tuiles", "bac-acier"]
  }
};
