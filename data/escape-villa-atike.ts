import { ConfigCategory, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const escapeVillaLayerOrder = [
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

const escapeVillaLayers = {
  backgroundLayer: "/images/houses/escape villa me atike/1. prapavija.png",
  constructionLayer: "/images/houses/escape villa me atike/2. kons.png",
  iso_inter_verre: "/images/houses/escape villa me atike/5. lesh xhami.png",
  iso_inter_roche: "/images/houses/escape villa me atike/3. lesh guri.png",
  iso_inter_bois: "/images/houses/escape villa me atike/4. lesh druri.png",
  iso_ext_roche_comprimee: "/images/houses/escape villa me atike/7. lesh guri jashte.png",
  iso_ext_polystyrene: "/images/houses/escape villa me atike/6. stiropori.png",
  iso_ext_fibre: "/images/houses/escape villa me atike/8. fibra.png",
  terrace_etancheite_epdm: "/images/houses/escape villa me atike/9. stiropori atikes.png",
  etancheite_epdm: "/images/houses/escape villa me atike/10. epdm.png",
  facade_blanche: "/images/houses/escape villa me atike/11. fasada e bardhe.png",
  facade_bardage: "/images/houses/escape villa me atike/12. fasada arish.png",
  windows_aluminium: "/images/houses/escape villa me atike/13. dritaret antracid.png",
  windows_pvc: "/images/houses/escape villa me atike/14. dritaret pvc.png"
} as const;

const escapeVillaDefaultImage = "/images/houses/escape villa me atike/7 ESCAPE VILLA.jpg";
const escapeVillaFinalImage = "/images/houses/escape villa me atike/10 ESCAPE VILLA.jpg";

const escapeVillaSizes: SizeOption[] = [
  {
    id: "60x160",
    label: "60x160",
    price: 1, // Placeholder price 1€
    image: escapeVillaDefaultImage
  },
  {
    id: "60x200",
    label: "60x200",
    price: 1, // Placeholder price 1€
    image: escapeVillaFinalImage
  }
];

const escapeVillaCategories: ConfigCategory[] = [
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
        price200: 12.5,
        layerKey: "iso_inter_verre",
        layer: escapeVillaLayers.iso_inter_verre,
        materialDescription: "Isolation intermédiaire classique en laine de verre."
      },
      {
        id: "laine-roche",
        label: "Laine de roche",
        price160: 12.5,
        price200: 13.8,
        layerKey: "iso_inter_roche",
        layer: escapeVillaLayers.iso_inter_roche,
        materialDescription: "Isolation en laine de roche pour une protection feu renforcée."
      },
      {
        id: "fibre-bois",
        label: "Laine de bois",
        price160: 16.5,
        price200: 18.2,
        layerKey: "iso_inter_bois",
        layer: escapeVillaLayers.iso_inter_bois,
        materialDescription: "Laine de bois à haute densité pour un excellent déphasage thermique."
      }
    ]
  },
  {
    id: "outerIsolation",
    inputName: "house_outer_isolation",
    label: "Isolation extérieure",
    description: "Couche d'isolation thermique par l'extérieur.",
    priceMode: "wall_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "roche-ext",
        label: "Laine de roche comprimée",
        price160: 15.9,
        price200: 17.4,
        layerKey: "iso_ext_roche_comprimee",
        layer: escapeVillaLayers.iso_ext_roche_comprimee,
        materialDescription: "Isolation extérieure en laine de roche comprimée."
      },
      {
        id: "polystyrene-ext",
        label: "Polystyrène",
        price160: 10.15,
        price200: 11.4,
        layerKey: "iso_ext_polystyrene",
        layer: escapeVillaLayers.iso_ext_polystyrene,
        materialDescription: "Polystyrène extérieur haute densité."
      },
      {
        id: "fibre",
        label: "Fibre de bois extérieure",
        price160: 14.2,
        price200: 15.6,
        layerKey: "iso_ext_fibre",
        layer: escapeVillaLayers.iso_ext_fibre,
        materialDescription: "Isolation extérieure écologique en fibre de bois."
      }
    ]
  },
  {
    id: "terraceEtancheite",
    inputName: "house_terrace_etancheite",
    label: "Isolation de l'attique",
    description: "Polystyrène isolant pour l'attique de la toiture terrasse.",
    priceMode: "roof_m2",
    selectionMode: "radio-toggle",
    options: [
      {
        id: "attic-polystyrene",
        label: "Polystyrène d'attique",
        price160: 15.5,
        price200: 17.0,
        layerKey: "terrace_etancheite_epdm",
        layer: escapeVillaLayers.terrace_etancheite_epdm,
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
        layer: escapeVillaLayers.etancheite_epdm,
        materialDescription: "Membrane élastomère EPDM garantissant une étanchéité parfaite de la terrasse."
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
        layer: escapeVillaLayers.facade_blanche,
        materialDescription: "Finition enduit blanc traditionnel."
      },
      {
        id: "bardage",
        label: "Bardage bois mélèze",
        price160: 16.9,
        price200: 18.5,
        layerKey: "facade_bardage",
        layer: escapeVillaLayers.facade_bardage,
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
        price160: 1, // Placeholder price 1€
        price200: 1, // Placeholder price 1€
        layerKey: "windows_aluminium",
        layer: escapeVillaLayers.windows_aluminium,
        materialDescription: "Menuiseries en aluminium thermolaqué de couleur anthracite."
      },
      {
        id: "pvc",
        label: "Menuiseries PVC",
        price160: 1, // Placeholder price 1€
        price200: 1, // Placeholder price 1€
        layerKey: "windows_pvc",
        layer: escapeVillaLayers.windows_pvc,
        materialDescription: "Menuiseries PVC haute performance d'isolation."
      }
    ]
  }
];

export const escapeVillaAtikeConfiguratorData: HouseConfiguratorData = {
  id: "escape-villa-me-atike",
  name: "Escape Villa avec Attique",
  category: "Maison toiture terrasse avec étage",
  subheading: "Découvrez l'Escape Villa avec Attique, une réalisation architecturale contemporaine et haut de gamme dotée d'une superbe toiture terrasse et de prestations énergétiques de premier ordre.",
  description: "L'Escape Villa avec Attique propose une intégration volumétrique moderne avec sa toiture plate attenante. Dotée d'une ossature bois performante et de larges ouvertures, elle favorise la luminosité naturelle et offre des finitions raffinées en bardage bois naturel de mélèze ou en enduit blanc. Entièrement personnalisable dans le configurateur.",
  specification: "Fiche technique de l'Escape Villa avec Attique. Toiture plate avec isolation d'attique en polystyrène et membrane d'étanchéité EPDM.",
  defaultImage: escapeVillaDefaultImage,
  finalImage: escapeVillaFinalImage,
  backgroundLayer: escapeVillaLayers.backgroundLayer,
  constructionLayer: escapeVillaLayers.constructionLayer,
  marginPercent: 40,
  perdhesa: {
    bruto: 120.4,
    neto: 104.2,
    mure_te_jashtme: 185,
    mure_mbajtese: 32,
    mure_ndarese: 50,
    pllaka_e_kulmit: 120
  },
  sizes: escapeVillaSizes,
  categories: escapeVillaCategories,
  layerOrder: escapeVillaLayerOrder,
  defaultSelection: {
    size: "60x160"
  },
  optionalCategoryIds: ["dritaret"],
  enableFlags: {
    enableRoofOption: false,
    enableEtancheiteOption: true,
    enableEtancheiteTerrasse: true, // true to enable terraceEtancheite category (stiropori atikes)
    enableCouvertureOption: false,
    enableFauxPlafondOption: false
  },
  structureInfo: "Structure en ossature bois de haute qualité conforme aux réglementations RE2020. Comprend la charpente, les poteaux, les murs extérieurs et intérieurs. Le prix de base inclut le transport et l'assemblage complet par nos compagnons charpentiers."
};
