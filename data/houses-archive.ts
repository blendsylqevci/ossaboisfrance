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
    slug: "ambre",
    title: "Ambre",
    category: "Maison Toiture Terrasse",
    description:
      "AMBRE est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste et une finition configurable.",
    image: "/images/houses/ambre/7 ambre.jpg",
    price60x160: 25985
  },
  {
    slug: "a-frame-house",
    title: "A frame house",
    category: "Maison Toiture Terrasse",
    description:
      "A Frame House est une maison modulaire contemporaine construite sur une ossature bois robuste, combinant architecture moderne et confort.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-a-frame-house-scaled.jpg",
    price60x160: 17022
  },
  {
    slug: "maison-loren",
    title: "MAISON LOREN",
    category: "Maison Toiture Terrasse",
    description:
      "MAISON LOREN est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste et une toiture terrasse.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/LOREN-7-scaled.jpg",
    price60x160: 20716
  },
  {
    slug: "ambre-sans-faitage",
    title: "Ambre Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "AMBRE attique est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste garantissant durabilité, stabilité et excellente performance thermique. Son architecture à toiture plate avec attique met en valeur des lignes modernes et épurées, tout en assurant une parfaite intégration dans des environnements urbains ou résidentiels contemporains. Grâce à une préfabrication soignée en atelier, AMBRE avec attique permet une installation rapide sur site.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-ambre-scaled.jpg",
    price60x160: 25985
  },
  {
    slug: "boreale",
    title: "Boreale Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "BORÉALE est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste garantissant stabilité, durabilité et excellente performance thermique. Son architecture à toiture plate met en valeur des lignes modernes et épurées, permettant une intégration harmonieuse dans des environnements urbains ou résidentiels contemporains. Grâce à une préfabrication soignée en atelier, BORÉALE assure une installation rapide sur site.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-boreale-scaled.jpg",
    price60x160: 27462
  },
  {
    slug: "maison-calme",
    title: "Maison Calme Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "MAISON CALME est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste et pensée pour le confort.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg",
    price60x160: 31292
  },
  {
    slug: "asebra",
    title: "ASEBRA Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle ASEBRA Toiture Terrasse séduit par son design contemporain, ses volumes harmonieux et son confort de vie.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2026/04/5-asebra-scaled.jpg",
    price60x160: 28693
  },
  {
    slug: "cotage-toiture-terrasse",
    title: "Cotage Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle Cotage Toiture Terrasse incarne une architecture moderne, épurée et chaleureuse, pensée pour un habitat fonctionnel.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2026/05/5-cottage-scaled.jpg",
    price60x160: 23400
  },
  {
    slug: "diademe-toiture-terrasse",
    title: "Diademe Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle Diademe Toiture Terrasse reflète une vision contemporaine de l’habitat, où simplicité architecturale, élégance naturelle et confort moderne se rencontrent harmonieusement. Avec sa toiture terrasse aux lignes épurées et sa façade en bois naturel au style raffiné, cette maison offre une esthétique chaleureuse et intemporelle, parfaitement adaptée aux environnements modernes comme aux paysages naturels. Pensée pour maximiser la lumière naturelle et la fluidité des espaces.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2026/05/7-diademe-scaled.jpg",
    price60x160: 26100
  },
  {
    slug: "emeraude-toiture-terrasse",
    title: "Emeraude Toiture Terrasse",
    category: "Maison Toiture Terrasse",
    description:
      "Le modèle Emeraude Toiture Terrasse incarne parfaitement l’équilibre entre modernité, sophistication architecturale et confort de vie haut de gamme. Avec ses lignes épurées, ses volumes harmonieux et sa toiture terrasse contemporaine, cette maison offre une esthétique raffinée pensée pour répondre aux exigences d’un mode de vie moderne et élégant. Disponible avec une finition façade moderne ou un habillage en bois naturel haut de gamme.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2026/05/7-EMERAUDE-scaled.jpg",
    price60x160: 28800
  },
  {
    slug: "maison-emmy",
    title: "Maison Emmy",
    category: "Maison toiture terrasse avec étage",
    description:
      "MAISON EMMY est une maison modulaire contemporaine à deux étages, conçue avec une ossature bois robuste et une toiture terrasse.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/EMMY-7-scaled.jpg",
    price60x160: 37157
  },
  {
    slug: "australe",
    title: "Australe",
    category: "Maison toiture terrasse avec étage",
    description:
      "AUSTRALE avec attique est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste garantissant stabilité, durabilité et excellente performance thermique. Son architecture à toiture plate avec attique, complétée par deux terrasses au deuxième étage, offre de vastes espaces extérieurs idéals pour la détente tout en valorisant des lignes modernes et épurées. Grâce à une préfabrication soignée en atelier, AUSTRALE avec attique permet une installation rapide.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-7-1-scaled.jpg",
    price60x160: 30393
  },
  {
    slug: "emmy-house-etage-toiture-terrasse",
    title: "Emmy House Étage Toiture Terrasse",
    category: "Maison toiture terrasse avec étage",
    description:
      "Le modèle Emmy House Étage Toiture Terrasse incarne une vision architecturale moderne, élégante et ambitieuse, conçue pour offrir un confort de vie exceptionnel dans un environnement raffiné et lumineux. Avec son architecture à étage, ses lignes minimalistes et sa toiture terrasse contemporaine, cette maison affirme un style haut de gamme inspiré des résidences modernes européennes. Son design équilibré met en valeur des volumes généreux.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2026/05/EMMY-7-scaled.jpg",
    price60x160: 27462
  },
  {
    slug: "a-frame-house-kulm",
    title: "A Frame House (kulm)",
    category: "Maison plein pied",
    description:
      "A Frame House avec toit est une maison modulaire moderne construite sur une ossature bois robuste, compacte et fonctionnelle.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/a-frame-house-me-kulm-7-scaled.jpg",
    price60x160: 16060
  },
  {
    slug: "asebra-me-kulm",
    title: "Asebra avec Toit",
    category: "Maison plein pied",
    description:
      "Le modèle Asebra avec Toit allie les espaces de vie spacieux et ouverts de plain-pied de la gamme Asebra au charme intemporel d'une toiture à double pente.",
    image: "/images/houses/asebra me kulm/asebra me kulm 7.jpg",
    price60x160: 28693
  },
  {
    slug: "maison-enea-me-kulm",
    title: "Enea avec Toit",
    category: "Maison plein pied",
    description:
      "Le modèle Enea avec Toit allie à la perfection l'optimisation des espaces de vie de plain-pied et l'élégance traditionnelle d'une toiture à double pente. Conçue avec une ossature bois haute performance et une isolation thermique avancée conforme à la RE2020, elle offre un cadre de vie sain, lumineux et durable.",
    image: "/images/houses/maison enea me kulm/enea me kulm 7.jpg",
    price60x160: 27850
  },
  {
    slug: "mairie",
    title: "MAIRIE",
    category: "Maison plein pied",
    description:
      "MAIRIE est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste et pensée pour le quotidien.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/mairie-kulm-7-scaled.jpg",
    price60x160: 20113
  },
  {
    slug: "maison-a",
    title: "Maison A",
    category: "Maison plein pied",
    description:
      "MAISON A est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png",
    price60x160: 20113
  },
  {
    slug: "maison-b",
    title: "Maison B",
    category: "Maison plein pied",
    description:
      "MAISON B est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png",
    price60x160: 19335
  },
  {
    slug: "maison-c",
    title: "Maison C",
    category: "Maison plein pied",
    description:
      "MAISON C est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois solide et moderne.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/maison-c-me-kulm-7-scaled.jpg",
    price60x160: 18037
  },
  {
    slug: "maison-d",
    title: "Maison D",
    category: "Maison plein pied",
    description:
      "MAISON D est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/Maison-D-7-scaled.jpg",
    price60x160: 15116
  },
  {
    slug: "maison-e",
    title: "Maison E",
    category: "Maison plein pied",
    description:
      "MAISON E est une maison modulaire contemporaine de plain-pied, réalisée avec une ossature bois solide.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/maison-E-me-kulm-7-scaled.jpg",
    price60x160: 15370
  },
  {
    slug: "maison-jola",
    title: "Maison Jola",
    category: "Maison plein pied",
    description:
      "MAISON JOLA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/Maison-Jola-6-scaled.jpg",
    price60x160: 17433
  },
  {
    slug: "maison-monna",
    title: "Maison Monna",
    category: "Maison plein pied",
    description:
      "MAISON MONNA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/maison-monna-me-kulm-7-scaled.jpg",
    price60x160: 19138
  },
  {
    slug: "medialuna",
    title: "Medialuna",
    category: "Maison plein pied",
    description:
      "MEDIALUNA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/medialuna-me-kulm-7-scaled.jpg",
    price60x160: 28605
  },
  {
    slug: "mountainview-cottage",
    title: "Mountainview Cottage",
    category: "Maison plein pied",
    description:
      "MOUNTAINVIEW COTTAGE est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png",
    price60x160: 14100
  },
  {
    slug: "cristal",
    title: "Cristal",
    category: "Maison combles amenageable",
    description:
      "CRISTAL est une maison modulaire contemporaine à ossature bois, conçue avec des combles aménageables.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/cristal-comble-7-scaled.jpg",
    price60x160: 37443
  },
  {
    slug: "dianne",
    title: "Dianne",
    category: "Maison combles amenageable",
    description:
      "DIANNE est une maison modulaire contemporaine à étage avec combles aménageables, construite sur une ossature bois.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/dianne-comble-7-scaled.jpg",
    price60x160: 26675
  },
  {
    slug: "mountain-valley-villa",
    title: "Mountain Valley Villa",
    category: "Maison avec étage",
    description:
      "MOUNTAIN VALLEY VILLA est une maison modulaire contemporaine à deux étages, construite sur une ossature bois.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/Mountain-Valley-Villa-7-scaled.jpg",
    price60x160: 20630
  },
  {
    slug: "nina-house",
    title: "Nina House",
    category: "Maison avec étage",
    description:
      "NINA HOUSE est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/nina-7-scaled.jpg",
    price60x160: 26863
  },
  {
    slug: "orenda",
    title: "Orenda",
    category: "Maison avec étage",
    description:
      "ORENDA est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/12/orenda-7-scaled.jpg",
    price60x160: 32550
  },
  {
    slug: "escape-villa-me-atike",
    title: "Escape Villa avec Attique",
    category: "Maison toiture terrasse avec étage",
    description:
      "L'Escape Villa avec Attique est une réalisation haut de gamme en ossature bois offrant une architecture à toiture terrasse avec des prestations modernes personnalisables.",
    image: "/images/houses/escape villa me atike/7 ESCAPE VILLA.jpg",
    price60x160: 1
  }
];

export function formatArchiveStartingPrice(price: number | null) {
  if (price === null || price === undefined) return null;
  const priceWithMargin = price * 1.40;

  // Format exactly with space as thousands separator and comma for decimals
  const formatted = priceWithMargin.toFixed(2);
  const [integerPart, decimalPart] = formatted.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${groupedInteger},${decimalPart}`;
}

export function findArchiveHouse(slug: string) {
  return houseArchiveItems.find((house) => house.slug === slug);
}
