export type HouseArchiveCategory = {
  id: string;
  title: string;
  sourceCategory: string;
};

export type HouseArchiveItem = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price60x160: number | null;
};

export const houseArchiveCategories: HouseArchiveCategory[] = [
  {
    id: "maison-toitu-terrasse",
    title: "Maisons à toiture terrasse",
    sourceCategory: "Maison Toiture Terrasse"
  },
  {
    id: "maison-sans-faitage",
    title: "Maisons à toiture terrasse avec étage",
    sourceCategory: "Maison toiture terrasse avec étage"
  },
  {
    id: "maison-plein-pied",
    title: "Maisons de plain-pied",
    sourceCategory: "Maison plein pied"
  },
  {
    id: "maison-combles-ammenageable",
    title: "Maisons avec combles aménageables",
    sourceCategory: "Maison combles amenageable"
  },
  {
    id: "maison-avec-etage",
    title: "Maisons avec étage",
    sourceCategory: "Maison avec étage"
  }
];

export const houseArchiveItems: HouseArchiveItem[] = [
  {
    slug: "a-frame-house",
    title: "A frame house",
    category: "Maison Toiture Terrasse",
    description:
      "A Frame House est une maison modulaire contemporaine construite sur une ossature bois robuste, combinant architecture moderne et confort.",
    image: "/images/houses/A frame house me atike/10 a frame house.jpg",
    price60x160: 17022
  },
  {
    slug: "maison-loren",
    title: "MAISON LOREN",
    category: "Maison Toiture Terrasse",
    description:
      "MAISON LOREN est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste et une toiture terrasse.",
    image: "/images/houses/Maison Loren me atike/LOREN 7.jpg",
    price60x160: 20716
  },
  {
    slug: "ambre-avec-attique",
    title: "Ambre avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Ambre avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne. Bâtie sur une structure robuste en ossature bois à haute performance énergétique (conforme RE2020), cette maison modulaire contemporaine offre des volumes intérieurs baignés de lumière grâce à ses larges ouvertures. Entièrement configurable, elle permet d'associer un enduit blanc épuré ou un bardage naturel en mélèze, offrant une intégration architecturale harmonieuse.",
    image: "/images/houses/ambre me atike/7 ambre.jpg",
    price60x160: 25985
  },
  {
    slug: "boreale-avec-attique",
    title: "Boreale avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Boreale avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020). Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
    image: "/images/houses/Boreale me atike/7 boreale.jpg",
    price60x160: 27462
  },
  {
    slug: "maison-calme",
    title: "Maison Calme Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "MAISON CALME est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste et pensée pour le confort.",
    image: "/images/houses/calme-atike/7 CALME.jpg",
    price60x160: 31292
  },
  {
    slug: "asebra-avec-attique",
    title: "Asebra avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Asebra avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique. Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
    image: "/images/houses/asebra me atike/4 asebra.jpg",
    price60x160: 28693
  },
  {
    slug: "cotage-toiture-terrasse",
    title: "Cotage Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle Cotage Toiture Terrasse incarne une architecture moderne, épurée et chaleureuse, pensée pour un habitat fonctionnel.",
    image: "/images/houses/cotage me atike/4 cottage.jpg",
    price60x160: 23400
  },
  {
    slug: "diademe-toiture-terrasse",
    title: "Diademe Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle Diademe Toiture Terrasse reflète une vision contemporaine de l’habitat, où simplicité architecturale, élégance naturelle et confort moderne se rencontrent harmonieusement. Avec sa toiture terrasse aux lignes épurées et sa façade en bois naturel au style raffiné, cette maison offre une esthétique chaleureuse et intemporelle, parfaitement adaptée aux environnements modernes comme aux paysages naturels. Pensée pour maximiser la lumière naturelle et la fluidité des espaces.",
    image: "/images/houses/diademe me atike/7 diademe.jpg",
    price60x160: 26100
  },
  {
    slug: "emeraude-avec-attique",
    title: "Emeraude avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Emeraude avec Attique incarne parfaitemet l’équilibre entre modernité, sophistication architecturale et confort de vie haut de gamme. Avec ses lignes épurées, ses volumes harmonieux et sa toiture terrasse contemporaine, cette maison offre une esthétique raffinée pensée pour répondre aux exigences d’un mode de vie moderne et élégant. Disponible avec une finition façade moderne ou un habillage en bois naturel haut de gamme.",
    image: "/images/houses/emeraude me atike/7 EMERAUDE.jpg",
    price60x160: 28800
  },
  {
    slug: "maison-emmy",
    title: "Emmy avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "MAISON EMMY est une maison modulaire contemporaine à deux étages, conçue avec une ossature bois robuste et une toiture terrasse.",
    image: "/images/houses/emmy house etage me atike/EMMY 7.jpg",
    price60x160: 37157
  },
  {
    slug: "enea-avec-attique",
    title: "Enea avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Enea avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne. Bâtie sur une structure robuste en ossature bois à haute performance énergétique (conforme RE2020), cette maison modulaire contemporaine offre des volumes intérieurs baignés de lumière grâce à ses larges ouvertures.",
    image: "/images/houses/enea me atike/4 enea.jpg",
    price60x160: 27850
  },
  {
    slug: "asebra-avec-toit",
    title: "Asebra avec Toit",
    category: "Maison plein pied",
    description:
      "Le modèle Asebra avec Toit allie les espaces de vie spacieux et ouverts de plain-pied de la gamme Asebra au charme intemporel d'une toiture à double pente.",
    image: "/images/houses/asebra me kulm/asebra me kulm 7.jpg",
    price60x160: 28693
  },
  {
    slug: "enea-avec-toit",
    title: "Enea avec Toit",
    category: "Maison plein pied",
    description:
      "Le modèle Enea avec Toit allie à la perfection l'optimisation des espaces de vie de plain-pied et l'élégance traditionnelle d'une toiture à double pente. Conçue avec une ossature bois haute performance et une isolation thermique avancée conforme à la RE2020, elle offre un cadre de vie sain, lumineux et durable.",
    image: "/images/houses/maison enea me kulm/enea me kulm 7.jpg",
    price60x160: 27850
  },
  {
    slug: "maison-e",
    title: "Maison E",
    category: "Maison plein pied",
    description:
      "MAISON E est une maison modulaire contemporaine de plain-pied, réalisée avec une ossature bois solide.",
    image: "/images/houses/maison e me atike/5 Maison E.jpg",
    price60x160: 21000
  },
  {
    slug: "medialuna",
    title: "Medialuna",
    category: "Maison plein pied",
    description:
      "MEDIALUNA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "/images/houses/medialuna me atike/7 medialuna.jpg",
    price60x160: 28605
  },
  {
    slug: "cristal",
    title: "Cristal",
    category: "Maison combles amenageable",
    description:
      "CRISTAL est une maison modulaire contemporaine à ossature bois, conçue avec des combles aménageables.",
    image: "/images/houses/cristal comble/cristal comble 7.jpg",
    price60x160: 37443
  },
  {
    slug: "dianne",
    title: "Dianne Comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle Dianne Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
    image: "/images/houses/Dianne Comble/dianne comble 7.jpg",
    price60x160: 26675
  },
  {
    slug: "elegance-comble",
    title: "Elegance Comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle Elegance Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale pour s'adapter à l'évolution de votre famille. Sa structure robuste en ossature bois à haute efficacité thermique garantit un confort de vie inégalé en toutes saisons.",
    image: "/images/houses/Elegance Comble/elegance comble 7.jpg",
    price60x160: 28500
  },
  {
    slug: "nina-house",
    title: "Nina comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle Nina Comble allie charme traditionnel et performance énergétique. Avec sa toiture inclinée à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
    image: "/images/houses/nina comble/nina 7.jpg",
    price60x160: 26863
  },
  {
    slug: "orenda",
    title: "Orenda comble",
    category: "Maison combles amenageable",
    description:
      "ORENDA est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
    image: "/images/houses/orenda comble/orenda 7.jpg",
    price60x160: 32550
  },
  {
    slug: "escape-villa-avec-attique",
    title: "Escape Villa avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Escape Villa avec Attique incarne la modernité absolue avec son architecture contemporaine à toiture terrasse and son attique raffiné. Conçue sur une structure en ossature bois de haute performance thermique, elle propose des volumes intérieurs optimisés and baignés de lumière grâce à ses grandes menuiseries. Personnalisable selon vos souhaits avec un bardage mélèze ou un enduit blanc, elle garantit confort, élégance and durabilité conformes aux exigences environnementales RE2020.",
    image: "/images/houses/escape villa me atike/7 ESCAPE VILLA.jpg",
    price60x160: 29500
  },
  {
    slug: "els-house-comble",
    title: "Els House comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle Els House Comble allie charme traditionnel and performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
    image: "/images/houses/Els House comble/els house 7.jpg",
    price60x160: 28000
  },
  {
    slug: "france-comble",
    title: "France comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle France Comble allie charme traditionnel and performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
    image: "/images/houses/France comble/france comble 5.jpg",
    price60x160: 29000
  },
  {
    slug: "mountain-valley-villa-comble",
    title: "Mountain valley villa comble",
    category: "Maison combles amenageable",
    description:
      "Le modèle Mountain Valley Villa Comble allie charme traditionnel and performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
    image: "/images/houses/mountain valley villa comble/Mountain Valley Villa 7.jpg",
    price60x160: 30000
  },
  {
    slug: "flora-avec-attique",
    title: "Flora avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Flora avec Attique séduit par son design contemporain, ses volumes harmonieux and sa structure robuste en ossature bois à haute performance thermique.",
    image: "/images/houses/flora me atike/7 flora.jpg",
    price60x160: 27800
  },
  {
    slug: "forest-side-cabin-avec-attique",
    title: "Forest Side Cabin avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Forest Side Cabin avec Attique allie architecture contemporaine, compacité and isolation de haute performance énergétique dans un style forestier unique.",
    image: "/images/houses/forest side cabin me atike/forest side cabin atike 7.jpg",
    price60x160: 26500
  },
  {
    slug: "france-etage-avec-attique",
    title: "France etage avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle France etage avec Attique séduit par son design contemporain, son architecture sur deux étages and sa terrasse moderne avec vue panoramique.",
    image: "/images/houses/France etage me atike/France atike 7.jpg",
    price60x160: 32000
  },
  {
    slug: "maison-en-l-avec-attique",
    title: "Maison en L avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Maison en L avec Attique séduit par son design contemporain en forme de L, ses volumes généreux and sa terrasse panoramique en attique.",
    image: "/images/houses/l shaped house me atike/4 l shaped house.jpg",
    price60x160: 34000
  },
  {
    slug: "liberte-etage-avec-attique",
    title: "Liberte etage avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Liberte etage avec Attique séduit par son design contemporain, son architecture sur deux étages and sa terrasse moderne avec vue panoramique.",
    image: "/images/houses/liberte etage me atike/liberte 5.jpg",
    price60x160: 31000
  },
  {
    slug: "maison-2-etages-avec-attique",
    title: "Maison 2 etages avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Maison 2 etage avec Attique séduit par son design contemporain, son architecture sur deux étages and sa terrasse moderne avec vue panoramique.",
    image: "/images/houses/maison 2 etage me atike/maison 2 me atike 7.jpg",
    price60x160: 33000
  },
  {
    slug: "australe",
    title: "Australe",
    category: "Maison toiture terrasse avec étage",
    description:
      "AUSTRALE avec attique est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
    image: "/images/houses/Australe/australe 7.jpg",
    price60x160: 41500
  }
];

export function formatArchiveStartingPrice(price: number | null) {
  if (price === null || price === undefined) return null;

  // Format exactly with space as thousands separator and comma for decimals
  const formatted = price.toFixed(2);
  const [integerPart, decimalPart] = formatted.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${groupedInteger},${decimalPart}`;
}

export function findArchiveHouse(slug: string) {
  return houseArchiveItems.find((house) => house.slug === slug);
}
