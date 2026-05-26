import { Locale } from "./i18n";

// Helper to translate dynamic database content that isn't fully localized in the PostgreSQL database.
// This maintains clean translation states without needing DB migrations.

const textTranslations: Record<string, Record<Locale, string>> = {
  // Configurator Categories
  "Structure en ossature bois": {
    fr: "Structure en ossature bois",
    en: "Timber frame structure",
    de: "Holzrahmenstruktur",
    nl: "Houtskeletstructuur"
  },
  "Isolation intermédiaire": {
    fr: "Isolation intermédiaire",
    en: "Intermediary insulation",
    de: "Zwischenisolierung",
    nl: "Tussenisolatie"
  },
  "Isolation extérieure": {
    fr: "Isolation extérieure",
    en: "Exterior insulation",
    de: "Außenisolierung",
    nl: "Buitenisolatie"
  },
  "Étanchéité toiture terrasse avec couvertine": {
    fr: "Étanchéité toiture terrasse avec couvertine",
    en: "Flat roof waterproofing with capping",
    de: "Flachdachabdichtung mit Abdeckung",
    nl: "Platdakwaterdichting met afdekkap"
  },
  "Étanchéité": {
    fr: "Étanchéité",
    en: "Waterproofing",
    de: "Abdichtung",
    nl: "Waterdichting"
  },
  "Film pare-pluie avec tas": {
    fr: "Film pare-pluie avec tas",
    en: "Rain barrier with lathing",
    de: "Regenschutz mit Lattung",
    nl: "Regenscherm met latwerk"
  },
  "Finition de la façade": {
    fr: "Finition de la façade",
    en: "Facade finish",
    de: "Fassadenfinish",
    nl: "Gevelafwerking"
  },
  "Isolation de la toiture par l'extérieur": {
    fr: "Isolation de la toiture par l'extérieur",
    en: "Roof insulation from the outside",
    de: "Dachisolierung von außen",
    nl: "Dakisolatie vanaf de buitenkant"
  },
  "Couverture": {
    fr: "Couverture",
    en: "Roof cover",
    de: "Dacheindeckung",
    nl: "Dakbedekking"
  },
  "Faux plafond": {
    fr: "Faux plafond",
    en: "False ceiling",
    de: "Zwischendecke",
    nl: "Verlaagd plafond"
  },
  "Menuiseries extérieures": {
    fr: "Menuiseries extérieures",
    en: "Exterior joinery / Windows",
    de: "Außenfenster",
    nl: "Buitenschrijnwerk"
  },

  // Descriptions of Categories
  "Choix de l'isolation entre les éléments de structure.": {
    fr: "Choix de l'isolation entre les éléments de structure.",
    en: "Choice of insulation between structural elements.",
    de: "Wahl der Dämmung zwischen den Strukturelementen.",
    nl: "Keuze van isolatie tussen de structurele elementen."
  },
  "Isolation appliquée depuis l'extérieur.": {
    fr: "Isolation appliquée depuis l'extérieur.",
    en: "Insulation applied from the outside.",
    de: "Von außen angebrachte Dämmung.",
    nl: "Isolatie aangebracht vanaf de buitenkant."
  },
  "Isolation pour toiture terrasse.": {
    fr: "Isolation pour toiture terrasse.",
    en: "Insulation for flat roof terraces.",
    de: "Dämmung für Flachdächer.",
    nl: "Isolatie voor platte daken."
  },
  "Membrane d'étanchéité pour toiture plate.": {
    fr: "Membrane d'étanchéité pour toiture plate.",
    en: "Waterproofing membrane for flat roofs.",
    de: "Abdichtungsbahn für Flachdächer.",
    nl: "Waterdicht membraan voor platte daken."
  },
  "Choisissez le revêtement extérieur de votre maison.": {
    fr: "Choisissez le revêtement extérieur de votre maison.",
    en: "Choose the exterior cladding for your house.",
    de: "Wählen Sie die Außenverkleidung für Ihr Haus.",
    nl: "Kies de buitenbekleding voor uw huis."
  },
  "Isolation pour charpente fermette.": {
    fr: "Isolation pour charpente fermette.",
    en: "Insulation for industrial roof trusses.",
    de: "Dämmung für Binderdachkonstruktionen.",
    nl: "Isolatie for spantenconstructies."
  },
  "Matériaux de couverture pour toit incliné.": {
    fr: "Matériaux de couverture pour toit incliné.",
    en: "Roofing materials for pitched roofs.",
    de: "Eindeckungsmaterialien für geneigte Dächer.",
    nl: "Dakbedekkingsmaterialen voor hellende daken."
  },
  "Isolation acoustique et thermique des faux plafonds.": {
    fr: "Isolation acoustique et thermique des faux plafonds.",
    en: "Acoustic and thermal insulation of false ceilings.",
    de: "Schall- und Wärmedämmung von Zwischendecken.",
    nl: "Akoestische en thermische isolatie van verlaagde plafonds."
  },
  "Choisissez les huisseries de votre maison (fenêtres et baies).": {
    fr: "Choisissez les huisseries de votre maison (fenêtres et baies).",
    en: "Choose the windows and sliding bays for your house.",
    de: "Wählen Sie die Fenster und Schiebetüren für Ihr Haus.",
    nl: "Kies de ramen en schuifpuien voor uw huis."
  },

  // Options labels
  "Laine de verre": {
    fr: "Laine de verre",
    en: "Glass wool",
    de: "Glaswolle",
    nl: "Glaswol"
  },
  "Laine de roche": {
    fr: "Laine de roche",
    en: "Rock wool",
    de: "Steinwolle",
    nl: "Steenwol"
  },
  "Laine de bois": {
    fr: "Laine de bois",
    en: "Wood wool",
    de: "Holzwolle",
    nl: "Houtwol"
  },
  "Laine de roche comprimée": {
    fr: "Laine de roche comprimée",
    en: "Compressed rock wool",
    de: "Komprimierte Steinwolle",
    nl: "Gecomprimeerde steenwol"
  },
  "Polystyrene": {
    fr: "Polystyrene",
    en: "Polystyrene",
    de: "Polystyrol",
    nl: "Polystyreen"
  },
  "Fibre": {
    fr: "Fibre",
    en: "Wood fibre",
    de: "Holzfaser",
    nl: "Houtvezel"
  },
  "Polystyrène d'attique": {
    fr: "Polystyrène d'attique",
    en: "Attic polystyrene",
    de: "Attika-Polystyrol",
    nl: "Attiek-polystyreen"
  },
  "Membrane EPDM": {
    fr: "Membrane EPDM",
    en: "EPDM Membrane",
    de: "EPDM-Membran",
    nl: "EPDM-membraan"
  },
  "Façade blanche (Enduit)": {
    fr: "Façade blanche (Enduit)",
    en: "White facade (Render)",
    de: "Weiße Fassade (Putz)",
    nl: "Witte gevel (Pleisterwerk)"
  },
  "Bardage Mélèze": {
    fr: "Bardage Mélèze",
    en: "Larch cladding",
    de: "Lärchenschalung",
    nl: "Larix bekleding"
  },
  "Laine de Verre - 220mm": {
    fr: "Laine de Verre - 220mm",
    en: "Glass wool - 220mm",
    de: "Glaswolle - 220mm",
    nl: "Glaswol - 220mm"
  },
  "Laine de Roche - 220mm": {
    fr: "Laine de Roche - 220mm",
    en: "Rock wool - 220mm",
    de: "Steinwolle - 220mm",
    nl: "Steenwol - 220mm"
  },
  "Laine de Bois - 220mm": {
    fr: "Laine de Bois - 220mm",
    en: "Wood wool - 220mm",
    de: "Holzwolle - 220mm",
    nl: "Houtwol - 220mm"
  },
  "Pare Pluie et Lattage": {
    fr: "Pare Pluie et Lattage",
    en: "Rain barrier & Lathing",
    de: "Regenschutz & Lattung",
    nl: "Regenscherm & Latwerk"
  },
  "Tuiles et Gouttières": {
    fr: "Tuiles et Gouttières",
    en: "Tiles & Gutters",
    de: "Ziegel & Dachrinnen",
    nl: "Dakpannen & Dakgoten"
  },
  "Bac Acier et Gouttières": {
    fr: "Bac Acier et Gouttières",
    en: "Steel sheet & Gutters",
    de: "Trapezblech & Dachrinnen",
    nl: "Stalen dakplaten & Dakgoten"
  },
  "Menuiseries Aluminium": {
    fr: "Menuiseries Aluminium",
    en: "Aluminium Joinery",
    de: "Aluminiumfenster",
    nl: "Aluminium buitenschrijnwerk"
  },
  "Menuiseries PVC": {
    fr: "Menuiseries PVC",
    en: "PVC Joinery",
    de: "PVC-Fenster",
    nl: "PVC buitenschrijnwerk"
  },

  // Material Descriptions (Option details)
  "Solution d'isolation légère et efficace pour les parois de la structure.": {
    fr: "Solution d'isolation légère et efficace pour les parois de la structure.",
    en: "Lightweight and efficient insulation solution for structural walls.",
    de: "Leichte und effiziente Dämmlösung für Strukturwände.",
    nl: "Lichte en efficiënte isolatieoplossing voor de structuurwanden."
  },
  "Isolation minérale avec une bonne tenue thermique et acoustique.": {
    fr: "Isolation minérale avec une bonne tenue thermique et acoustique.",
    en: "Mineral insulation with good thermal and acoustic performance.",
    de: "Mineralische Dämmung mit guter thermischer und akustischer Leistung.",
    nl: "Minerale isolatie met goede thermische en akoestische prestaties."
  },
  "Isolation biosourcée, choisie pour le confort thermique et l'inertie naturelle.": {
    fr: "Isolation biosourcée, choisie pour le confort thermique et l'inertie naturelle.",
    en: "Bio-sourced insulation, chosen for thermal comfort and natural inertia.",
    de: "Ökologische Dämmung, gewählt für thermischen Komfort und natürliche Trägheit.",
    nl: "Bio-ecologische isolatie, gekozen voor thermisch comfort en natuurlijke traagheid."
  },
  "Isolation extérieure dense en laine de roche comprimée, robuste et stable.": {
    fr: "Isolation extérieure dense en laine de roche comprimée, robuste et stable.",
    en: "Dense exterior insulation in compressed rock wool, robust and stable.",
    de: "Dichte Außendämmung aus komprimierter Steinwolle, robust und stabil.",
    nl: "Dichte buitenisolatie van gecomprimeerde steenwol, robuust en stabiel."
  },
  "Isolation extérieure en polystyrène pour une enveloppe continue et un coût maîtrisé.": {
    fr: "Isolation extérieure en polystyrène pour une enveloppe continue et un coût maîtrisé.",
    en: "Polystyrene exterior insulation for a continuous envelope and controlled cost.",
    de: "Außendämmung aus Polystyrol für eine lückenlose Hülle und kontrollierte Kosten.",
    nl: "Buitenisolatie van polystyreen voor een doorlopende schil en gecontroleerde kosten."
  },
  "Isolation extérieure biosourcée haute densité en fibre de bois.": {
    fr: "Isolation extérieure biosourcée haute densité en fibre de bois.",
    en: "High-density bio-sourced wood fibre exterior insulation.",
    de: "Hochdichte ökologische Außendämmung aus Holzfaser.",
    nl: "Buitenisolatie van bio-ecologische houtvezel met hoge dichtheid."
  },
  "Plaques de polystyrène expansé spécifiques pour l'étanchéité d'attique.": {
    fr: "Plaques de polystyrène expansé spécifiques pour l'étanchéité d'attique.",
    en: "Specific expanded polystyrene plates for attic waterproofing.",
    de: "Spezielle expandierte Polystyrolplatten zur Attikaabdichtung.",
    nl: "Specifieke geëxpandeerde polystyreenplaten voor attiekwaterdichting."
  },
  "Membrane synthétique monocouche offrant une étanchéité totale et durable.": {
    fr: "Membrane synthétique monocouche offrant une étanchéité totale et durable.",
    en: "Single-layer synthetic membrane offering total and durable waterproofing.",
    de: "Einlagige synthetische Membran für vollständige und dauerhafte Abdichtung.",
    nl: "Eenlaags synthetisch membraan voor een volledige en duurzame waterdichting."
  },
  "Finition par enduit blanc offrant un aspect propre, moderne et lumineux.": {
    fr: "Finition par enduit blanc offrant un aspect propre, moderne et lumineux.",
    en: "White render finish offering a clean, modern, and bright appearance.",
    de: "Weißer Putz für ein sauberes, modernes und helles Erscheinungsbild.",
    nl: "Afwerking met witte pleister voor een strakke, moderne en lichte uitstraling."
  },
  "Finition par clin de bois en Mélèze naturel pour un look chaleureux et authentique.": {
    fr: "Finition par clin de bois en Mélèze naturel pour un look chaleureux et authentique.",
    en: "Natural Larch wood cladding finish for a warm and authentic look.",
    de: "Fassadenverkleidung aus natürlicher Lärche für eine warme und authentische Optik.",
    nl: "Afwerking met houten gevelbekleding van natuurlijk larix voor een warme en authentieke uitstraling."
  },
  "Laine de verre soufflée offrant une excellente barrière thermique homogène.": {
    fr: "Laine de verre soufflée offrant une excellente barrière thermique homogène.",
    en: "Blown glass wool offering an excellent and homogeneous thermal barrier.",
    de: "Einblas-Glaswolle für eine hervorragende, homogene Wärmebarriere.",
    nl: "Ingeblazen glaswol die een uitstekende en homogene thermische barrière biedt."
  },
  "Isolation par soufflage de laine de roche stable, dense et résistante au feu.": {
    fr: "Isolation par soufflage de laine de roche stable, dense et résistante au feu.",
    en: "Stable, dense, and fire-resistant rock wool blow-in insulation.",
    de: "Stabile, dichte und feuerbeständige Steinwolle-Einblasdämmung.",
    nl: "Stabiele, dichte en brandwerende ingeblazen steenwol isolatie."
  },
  "Isolation rigide haute performance par plaques de fibre de bois.": {
    fr: "Isolation rigide haute performance par plaques de fibre de bois.",
    en: "High-performance rigid wood fibre board insulation.",
    de: "Hochleistungsfähige feste Dämmung durch Holzfaserplatten.",
    nl: "Hoogwaardige harde isolatie door houtvezelplaten."
  },
  "Écran sous toiture HPV et contre-lattage assurant la ventilation.": {
    fr: "Écran sous toiture HPV et contre-lattage assurant la ventilation.",
    en: "Highly vapor-permeable underlay and counter-lathing ensuring ventilation.",
    de: "Hochdampfdurchlässige Unterspannbahn und Konterlattung zur Belüftung.",
    nl: "Zeer dampopen onderdakfolie en tengellatten voor ventilatie."
  },
  "Tuiles béton ou terre cuite avec gouttières de récupération d'eau pluviale.": {
    fr: "Tuiles béton ou terre cuite avec gouttières de récupération d'eau pluviale.",
    en: "Concrete or clay tiles with rainwater harvesting gutters.",
    de: "Beton- oder Tonziegel mit Dachrinnen zur Regenwassernutzung.",
    nl: "Betonnen of gebakken dakpannen met regenwatergoten."
  },
  "Couverture sèche en tôle d'acier profilée très résistante aux intempéries.": {
    fr: "Couverture sèche en tôle d'acier profilée très résistante aux intempéries.",
    en: "Dry cladding in profiled steel sheet, highly resistant to weather.",
    de: "Trockeneindeckung aus profiliertem Stahlblech, sehr witterungsbeständig.",
    nl: "Droge dakbedekking van geprofileerde staalplaat, zeer weerbestendig."
  },
  "Isolation soufflée légère et thermiquement performante.": {
    fr: "Isolation soufflée légère et thermiquement performante.",
    en: "Lightweight and thermally efficient blown insulation.",
    de: "Leichte und thermisch effiziente Einblasdämmung.",
    nl: "Lichte en thermisch efficiënte ingeblazen isolatie."
  },
  "Soufflage dense offrant d'excellentes qualités d'absorption acoustique.": {
    fr: "Soufflage dense offrant d'excellentes qualités d'absorption acoustique.",
    en: "Dense blowing offering excellent acoustic absorption qualities.",
    de: "Dichtes Einblasen für hervorragende Schallabsorptionseigenschaften.",
    nl: "Dichte inblazing die uitstekende geluidsabsorberende kwaliteiten biedt."
  },
  "Fibre de bois soufflée naturelle, écologique et à fort pouvoir isolant.": {
    fr: "Fibre de bois soufflée naturelle, écologique et à fort pouvoir isolant.",
    en: "Natural, ecological blown wood fibre with high insulating power.",
    de: "Natürliche, ökologische Einblas-Holzfaser mit hoher Dämmwirkung.",
    nl: "Natuurlijke, ecologische ingeblazen houtvezel met een hoge isolatiewaarde."
  },
  "Menuiseries en aluminium thermolaqué de couleur anthracite avec double vitrage performant.": {
    fr: "Menuiseries en aluminium thermolaqué de couleur anthracite avec double vitrage performant.",
    en: "Powder-coated aluminium joinery in anthracite color with high-performance double glazing.",
    de: "Pulverbeschichtete Aluminiumfenster in Anthrazit mit Hochleistungs-Doppelverglasung.",
    nl: "Gepoedercoat aluminium buitenschrijnwerk in antracietkleur met hoogwaardige dubbele beglazing."
  },
  "Menuiseries PVC haute isolation offrant le meilleur rapport performance/prix.": {
    fr: "Menuiseries PVC haute isolation offrant le meilleur rapport performance/prix.",
    en: "High-insulation PVC joinery offering the best performance/price ratio.",
    de: "Hochisolierende PVC-Fenster mit dem besten Preis-Leistungs-Verhältnis.",
    nl: "Hoogisolerend PVC buitenschrijnwerk met de beste prijs-kwaliteitverhouding."
  },

  // Modal description templates
  "La laine de roche est un isolant hautement performant fabriqué à partir de roches volcaniques fondues et filées en fibres. Elle offre une excellente isolation thermique et acoustique, tout en étant incombustible.": {
    fr: "La laine de roche est un isolant hautement performant fabriqué à partir de roches volcaniques fondues et filées en fibres. Elle offre une excellente isolation thermique et acoustique, tout en étant incombustible.",
    en: "Rock wool is a highly efficient insulation material made from molten volcanic rocks spun into fibers. It offers excellent thermal and acoustic insulation while being non-combustible.",
    de: "Steinwolle ist ein hocheffizienter Dämmstoff aus geschmolzenem Vulkangestein, das zu Fasern gesponnen wird. Sie bietet eine hervorragende Wärme- und Schalldämmung und ist unbrennbar.",
    nl: "Steenwol is een zeer efficiënt isolatiemateriaal gemaakt van gesmolten vulkanisch gesteente dat tot vezels is gesponnen. Het biedt een uitstekende thermische en akoestische isolatie en is onbrandbaar."
  },
  "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.": {
    fr: "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.",
    en: "Timber frame structure built according to current standards, braced by 12 mm OSB panels ensuring rigidity and stability of the whole. Includes load-bearing walls, partition walls, and industrial truss framework. Price includes transport and on-site assembly under a decennial guarantee.",
    de: "Holzrahmenstruktur nach den geltenden Normen gebaut, versteift durch 12 mm OSB-Platten zur Gewährleistung der Steifigkeit und Stabilität des Ganzen. Umfasst tragende Wände, Trennwände und Dachbinder. Der Preis beinhaltet Transport und Montage vor Ort unter einer zehnjährigen Garantie.",
    nl: "Houtskeletstructuur gebouwd volgens de geldende normen, geschoord met 12 mm OSB-platen om de stijfheid en stabiliteit van het geheel te garanderen. Inclusief dragende muren, scheidingswanden en spanten. Prijs is inclusief transport en montage ter plaatse onder een tienjarige garantie."
  },
  "Le modèle Monna avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.": {
    fr: "Le modèle Monna avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.",
    en: "The Monna with Penthouse model combines the elegance of a flat roof terrace with the functionality of a modern penthouse.",
    de: "Das Modell Monna mit Attika verbindet die Eleganz einer Flachdach-Terrasse mit der Funktionalität einer modernen Attika.",
    nl: "Het Monna met Attiek model combineert de elegantie van een plat dakterras met de functionaliteit van een moderne attiek."
  },
  "Diademe Toiture Terrasse — Simplicité architecturale, élégance naturelle et confort moderne.": {
    fr: "Diademe Toiture Terrasse — Simplicité architecturale, élégance naturelle et confort moderne.",
    en: "Diademe Toiture Terrasse — Architectural simplicity, natural elegance, and modern comfort.",
    de: "Diademe Toiture Terrasse — Architektonische Schlichtheit, natürliche Eleganz und moderner Komfort.",
    nl: "Diademe Toiture Terrasse — Architectonische eenvoud, natuurlijke elegantie en modern comfort."
  },
  "Cotage Toiture Terrasse — L’élégance contemporaine au service du confort naturel.": {
    fr: "Cotage Toiture Terrasse — L’élégance contemporaine au service du confort naturel.",
    en: "Cotage Toiture Terrasse — Contemporary elegance at the service of natural comfort.",
    de: "Cotage Toiture Terrasse — Zeitgenössische Eleganz im Dienste des natürlichen Komforts.",
    nl: "Cotage Toiture Terrasse — Eigentijdse elegantie in dienst van natuurlijk comfort."
  },
  "ASEBRA Toiture Terrasse — Une architecture moderne pensée pour une vie élégante et apaisante.": {
    fr: "ASEBRA Toiture Terrasse — Une architecture moderne pensée pour une vie élégante et apaisante.",
    en: "ASEBRA Toiture Terrasse — Modern architecture designed for an elegant and soothing life.",
    de: "ASEBRA Toiture Terrasse — Moderne Architektur für ein elegantes und beruhigendes Leben.",
    nl: "ASEBRA Toiture Terrasse — Moderne architectuur ontworpen voor een elegant en rustgevend leven."
  },
  "Le modèle Ambre avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.": {
    fr: "Le modèle Ambre avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.",
    en: "The Ambre with Penthouse model combines the elegance of a flat roof terrace with the functionality of a modern penthouse.",
    de: "Das Modell Ambre mit Attika verbindet die Eleganz einer Flachdach-Terrasse mit der Funktionalität einer modernen Attika.",
    nl: "Het Ambre met Attiek model combineert de elegantie van een plat dakterras met de functionaliteit van een moderne attiek."
  },
  "Le modèle Boreale avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020).": {
    fr: "Le modèle Boreale avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020).",
    en: "The Boreale with Penthouse model appeals with its contemporary design, harmonious volumes, and robust timber frame structure with high thermal performance (RE2020 compliant).",
    de: "Das Modell Boreale mit Attika besticht durch sein zeitgenössisches design, seine harmonischen Volumina und seine robuste Holzrahmenstruktur mit hoher thermischer Leistung (RE2020-konform).",
    nl: "Het Boreale met Attiek model spreekt aan met zijn eigentijdse design, harmonieuze volumes en robuuste houtskeletstructuur met hoge thermische prestaties (RE2020-conform)."
  },
  "Monna avec Attique": {
    fr: "Monna avec Attique",
    en: "Monna with Penthouse",
    de: "Monna mit Attika",
    nl: "Monna met Attiek"
  },
  "Ambre avec Attique": {
    fr: "Ambre avec Attique",
    en: "Ambre with Penthouse",
    de: "Ambre mit Attika",
    nl: "Ambre met Attiek"
  },
  "Boreale avec Attique": {
    fr: "Boreale avec Attique",
    en: "Boreale with Penthouse",
    de: "Boreale mit Attika",
    nl: "Boreale met Attiek"
  },
  "Asebra avec Attique": {
    fr: "Asebra avec Attique",
    en: "Asebra with Penthouse",
    de: "Asebra mit Attika",
    nl: "Asebra met Attiek"
  },
  "Diademe Toiture Terrasse": {
    fr: "Diademe Toiture Terrasse",
    en: "Diademe Flat Roof",
    de: "Diademe Flachdach",
    nl: "Diademe Plat Dak"
  },
  "Cotage Toiture Terrasse": {
    fr: "Cotage Toiture Terrasse",
    en: "Cotage Flat Roof",
    de: "Cotage Flachdach",
    nl: "Cotage Plat Dak"
  },
  "Enea avec combles aménageables": {
    fr: "Enea avec combles aménageables",
    en: "Enea with convertible loft",
    de: "Enea mit ausbaubarem Dachgeschoss",
    nl: "Enea met inrichtbare zolder"
  }
};

// General function to translate plain text or configuration values.
export function translateText(text: string | null | undefined, locale: Locale): string {
  if (!text) return "";
  if (locale === "fr") return text;

  const trimText = text.trim();
  const directMatch = textTranslations[trimText];
  if (directMatch && directMatch[locale]) {
    return directMatch[locale];
  }

  return text;
}

// Custom descriptions regex translation mappings
export function translateHouseDescription(description: string | null | undefined, slug: string, locale: Locale): string {
  if (!description) return "";
  if (locale === "fr") return description;

  // Direct Slug-based translation overrides
  const slugDescriptions: Record<string, Record<Locale, string>> = {
    "a-frame-house": {
      fr: "A Frame House est une maison modulaire contemporaine construite sur une ossature bois robuste, combinant architecture moderne et confort.",
      en: "A Frame House is a contemporary modular home built on a robust timber frame, combining modern architecture and comfort.",
      de: "A Frame House ist ein modernes Modulhaus, gebaut auf einem robusten Holzrahmen, das moderne Architektur und Komfort verbindet.",
      nl: "A Frame House is een eigentijds modulair huis gebouwd op een robuust houtskelet, dat moderne architectuur en comfort combineert."
    },
    "maison-loren": {
      fr: "MAISON LOREN est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois robuste et une toiture terrasse.",
      en: "MAISON LOREN is a contemporary single-story modular home, designed with a robust timber frame and a flat roof terrace.",
      de: "MAISON LOREN ist ein zeitgenössisches einstöckiges Modulhaus, entworfen mit einem robusten Holzrahmen und einer Dachterrasse.",
      nl: "MAISON LOREN is een eigentijdse gelijkvloerse modulaire woning, ontworpen met een robuust houtskelet en een plat dakterras."
    },
    "maison-calme": {
      fr: "MAISON CALME est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste et pensée pour le confort.",
      en: "MAISON CALME is a contemporary single-story modular home, built on a robust timber frame and designed for comfort.",
      de: "MAISON CALME ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen und auf Komfort ausgelegt.",
      nl: "MAISON CALME is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet en ontworpen voor comfort."
    },
    "cotage-toiture-terrasse": {
      fr: "Le modèle Cotage Toiture Terrasse incarne une architecture moderne, épurée et chaleureuse, pensée pour un habitat fonctionnel.",
      en: "The Cotage Toiture Terrasse model embodies a modern, clean, and warm architecture, designed for a functional home.",
      de: "Das Modell Cotage Toiture Terrasse verkörpert eine moderne, klare und warme Architektur, entworfen für ein funktionelles Zuhause.",
      nl: "Het Cotage Toiture Terrasse model belichaamt een moderne, strakke en warme architectuur, ontworpen voor een functioneel huis."
    },
    "diademe-toiture-terrasse": {
      fr: "Le modèle Diademe Toiture Terrasse reflète une vision contemporaine de l’habitat, où simplicité architecturale, élégance naturelle et confort moderne se rencontrent harmonieusement. Avec sa toiture terrasse aux lignes épurées et sa façade en bois naturel au style raffiné, cette maison offre une esthétique chaleureuse et intemporelle, parfaitement adaptée aux environnements modernes comme aux paysages naturels. Pensée pour maximiser la lumière naturelle et la fluidité des espaces.",
      en: "The Diademe Toiture Terrasse model reflects a contemporary vision of living, where architectural simplicity, natural elegance, and modern comfort meet harmoniously. With its flat roof terrace with clean lines and its natural wood facade in a refined style, this house offers a warm and timeless aesthetic, perfectly adapted to modern environments and natural landscapes. Designed to maximize natural light and the fluidity of spaces.",
      de: "Das Modell Diademe Toiture Terrasse spiegelt eine zeitgemäße Vision des Wohnens wider, bei der sich architektonische Einfachheit, natürliche Eleganz und moderner Komfort harmonisch treffen. Mit seiner Flachdachterrasse mit klaren Linien und seiner natürlichen Holzfassade in einem raffinierten Stil bietet dieses Haus eine warme und zeitlose Ästhetik, die sich perfekt in moderne Umgebungen und Naturlandschaften einfügt. Entworfen, um das natürliche Licht und den Fluss der Räume zu maximieren.",
      nl: "Het Diademe Toiture Terrasse model weerspiegelt een hedendaagse visie op wonen, waar architecturale eenvoud, natuurlijke elegantie en modern comfort elkaar harmonieus ontmoeten. Met zijn platte dakterras met strakke lijnen en zijn natuurlijke houten gevel in een verfijnde stijl, biedt dit huis een warme en tijdloze esthetiek, perfect aangepast aan moderne omgevingen en natuurlijke landschappen. Ontworpen om natuurlijk licht en de vloeiendheid van ruimtes te maximaliseren."
    },
    "maison-emmy": {
      fr: "MAISON EMMY est une maison modulaire contemporaine à deux étages, conçue avec une ossature bois robuste et une toiture terrasse.",
      en: "MAISON EMMY is a contemporary modular two-story house, designed with a robust timber frame and a flat roof terrace.",
      de: "MAISON EMMY ist ein modernes zweistöckiges Modulhaus, entworfen mit einem robusten Holzrahmen und einer Dachterrasse.",
      nl: "MAISON EMMY is een eigentijds modulair huis met twee verdiepingen, ontworpen met een robuust houtskelet en een plat dakterras."
    },
    "emmy-house-etage-toiture-terrasse": {
      fr: "Le modèle Emmy House Étage Toiture Terrasse incarne une vision architecturale moderne, élégante et ambtieuse, conçue pour offrir un confort de vie exceptionnel dans un environnement raffiné et lumineux. Avec son architecture à étage, ses lignes minimalistes et sa toiture terrasse contemporaine, cette maison affirme un style haut de gamme inspiré des résidences modernes européennes. Son design équilibré met en valeur des volumes généreux.",
      en: "The Emmy House Étage Toiture Terrasse model embodies a modern, elegant, and ambitious architectural vision, designed to offer exceptional living comfort in a refined and bright environment. With its two-story architecture, minimalist lines, and contemporary flat roof terrace, this house asserts a premium style inspired by modern European residences. Its balanced design emphasizes generous volumes.",
      de: "Das Modell Emmy House Étage Toiture Terrasse verkörpert eine moderne, elegante und ehrgeizige architektonische Vision, die darauf ausgelegt ist, außergewöhnlichen Wohnkomfort in einer raffinierten und hellen Umgebung zu bieten. Mit seiner zweistöckigen Architektur, den minimalistischen Linien und der zeitgemäßen Flachdachterrasse besticht dieses Haus durch einen erstklassigen Stil, der von modernen europäischen Residenzen inspiriert ist. Sein ausgewogenes Design betont großzügige Volumina.",
      nl: "Het Emmy House Étage Toiture Terrasse model belichaamt een moderne, elegante en ambitieuze architectonische visie, ontworpen om uitzonderlijk leefcomfort te bieden in een verfijnde en lichte omgeving. Met zijn architectuur met twee verdiepingen, minimalistische lijnen en eigentijds plat dakterras, straalt dit huis een premium stijl uit geïnspireerd door moderne Europese woningen. Het uitgebalanceerde ontwerp benadrukt royale volumes."
    },
    "a-frame-house-kulm": {
      fr: "A Frame House avec toit est une maison modulaire moderne construite sur une ossature bois robuste, compacte et fonctionnelle.",
      en: "A Frame House with roof is a modern modular home built on a robust, compact, and functional timber frame.",
      de: "A Frame House mit Dach ist ein modernes Modulhaus, gebaut auf einem robusten, kompakten und funktionalen Holzrahmen.",
      nl: "A Frame House met dak is een eigentijds modulair huis gebouwd op een robuust, compact en functioneel houtskelet."
    },
    "mairie": {
      fr: "MAIRIE est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste et pensée pour le quotidien.",
      en: "MAIRIE is a contemporary single-story modular home, built on a robust timber frame and designed for daily life.",
      de: "MAIRIE ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen und für den Alltag konzipiert.",
      nl: "MAIRIE is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet en ontworpen voor het dagelijks leven."
    },
    "maison-a": {
      fr: "MAISON A est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MAISON A is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MAISON A ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MAISON A is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "maison-b": {
      fr: "MAISON B est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MAISON B is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MAISON B ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MAISON B is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "maison-c": {
      fr: "MAISON C est une maison modulaire contemporaine de plain-pied, conçue avec une ossature bois solide et moderne.",
      en: "MAISON C is a contemporary single-story modular home, designed with a solid and modern timber frame.",
      de: "MAISON C ist ein zeitgenössisches einstöckiges Modulhaus, entworfen mit einem soliden und modernen Holzrahmen.",
      nl: "MAISON C is een eigentijdse gelijkvloerse modulaire woning, ontworpen met een solide en modern houtskelet."
    },
    "maison-d": {
      fr: "MAISON D est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MAISON D is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MAISON D ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MAISON D is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "maison-e": {
      fr: "MAISON E est une maison modulaire contemporaine de plain-pied, réalisée avec une ossature bois solide.",
      en: "MAISON E is a contemporary single-story modular home, made with a solid timber frame.",
      de: "MAISON E ist ein zeitgenössisches einstöckiges Modulhaus, hergestellt mit einem soliden Holzrahmen.",
      nl: "MAISON E is een eigentijdse gelijkvloerse modulaire woning, gemaakt met een solide houtskelet."
    },
    "maison-jola": {
      fr: "MAISON JOLA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MAISON JOLA is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MAISON JOLA ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MAISON JOLA is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "maison-monna": {
      fr: "MAISON MONNA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois.",
      en: "MAISON MONNA is a contemporary single-story modular home, built on a timber frame.",
      de: "MAISON MONNA ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem Holzrahmen.",
      nl: "MAISON MONNA is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een houtskelet."
    },
    "medialuna": {
      fr: "MEDIALUNA est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MEDIALUNA is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MEDIALUNA ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MEDIALUNA is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "mountainview-cottage": {
      fr: "MOUNTAINVIEW COTTAGE est une maison modulaire contemporaine de plain-pied, construite sur une ossature bois robuste.",
      en: "MOUNTAINVIEW COTTAGE is a contemporary single-story modular home, built on a robust timber frame.",
      de: "MOUNTAINVIEW COTTAGE ist ein zeitgenössisches einstöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "MOUNTAINVIEW COTTAGE is een eigentijdse gelijkvloerse modulaire woning, gebouwd op een robuust houtskelet."
    },
    "cristal": {
      fr: "CRISTAL est une maison modulaire contemporaine à ossature bois, conçue avec des combles aménageables.",
      en: "CRISTAL is a contemporary modular timber frame home, designed with a convertible loft.",
      de: "CRISTAL ist ein modernes Holzrahmen-Modulhaus mit ausbaubarem Dachgeschoss.",
      nl: "CRISTAL is een eigentijdse modulaire houtskeletwoning, ontworpen met een inrichtbare zolder."
    },
    "mountain-valley-villa": {
      fr: "MOUNTAIN VALLEY VILLA est une maison modulaire contemporaine à deux étages, construite sur une ossature bois.",
      en: "MOUNTAIN VALLEY VILLA is a contemporary modular two-story house, built on a timber frame.",
      de: "MOUNTAIN VALLEY VILLA ist ein zeitgenössisches zweistöckiges Modulhaus, gebaut auf einem Holzrahmen.",
      nl: "MOUNTAIN VALLEY VILLA is een eigentijds modulair huis met twee verdiepingen, gebouwd op een houtskelet."
    },
    "mountain-valley-villa-comble": {
      fr: "Le modèle Mountain Valley Villa Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale.",
      en: "The Mountain Valley Villa Comble model combines traditional charm with energy performance. With its steep roof housing a convertible loft, it offers optimal layout flexibility.",
      de: "Das Modell Mountain Valley Villa Comble verbindet traditionellen Charme mit Energieeffizienz. Mit seinem Steildach, das ein ausbaubares Dachgeschoss beherbergt, bietet es optimale Flexibilität bei der Gestaltung.",
      nl: "Het Mountain Valley Villa Comble model combineert traditionele charme met energieprestaties. Met zijn steile dak waarin een inrichtbare zolder is ondergebracht, biedt het een optimale flexibiliteit in indeling."
    },
    "orenda": {
      fr: "ORENDA est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
      en: "ORENDA is a contemporary modular two-story house, built on a robust timber frame.",
      de: "ORENDA ist ein zeitgenössisches zweistöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "ORENDA is een eigentijds modulair huis met twee verdiepingen, gebouwd op een robuust houtskelet."
    },
    "australe": {
      fr: "AUSTRALE avec attique est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
      en: "AUSTRALE with penthouse is a contemporary modular two-story house, built on a robust timber frame.",
      de: "AUSTRALE mit Attika ist ein zeitgenössisches zweistöckiges Modulhaus, gebaut auf einem robusten Holzrahmen.",
      nl: "AUSTRALE met attiek is een eigentijds modulair huis met twee verdiepingen, gebouwd op een robuust houtskelet."
    }
  };

  const override = slugDescriptions[slug];
  if (override && override[locale]) {
    return override[locale];
  }

  // Regex-based template translations for repeating formulas
  // 1. Template 1: Le modèle [X] avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.
  if (description.includes("réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+avec Attique réunit/);
    const name = match ? match[1].trim() : "";

    const enText = `The ${name} with Penthouse model combines the elegance of a flat roof terrace with the functionality of a modern penthouse. Built on a robust timber frame structure with high energy performance (RE2020 compliant), this contemporary modular home offers bright interior spaces thanks to its large openings.`;
    const deText = `Das Modell ${name} mit Attika verbindet die Eleganz einer Flachdach-Terrasse mit der Funktionalität einer modernen Attika. Aufgebaut auf einer robusten Holzrahmenstruktur mit hoher Energieeffizienz (E-Plan konform), bietet dieses moderne Modulhaus helle Innenräume dank seiner großen Öffnungen.`;
    const nlText = `Het ${name} met Attiek model combineert de elegantie van een plat dakterras met de functionaliteit van een moderne attiek. Gebouwd op een robuuste houtskeletstructuur met hoge energieprestaties (RE2020-conform), biedt dit eigentijdse modulaire huis lichte binnenruimtes dankzij de grote openingen.`;

    // Handle Ambre's additional text if present
    const extraAmbre = "Entièrement configurable, elle permet d'associer un enduit blanc épuré ou un bardage naturel en mélèze, offrant une intégration architecturale harmonieuse.";
    if (description.includes(extraAmbre)) {
      if (locale === "en") return enText + " " + "Fully configurable, it allows combining a clean white render or a natural larch cladding, offering a harmonious architectural integration.";
      if (locale === "de") return deText + " " + "Vollständig konfigurierbar, ermöglicht es die Kombination von weißem Putz oder einer natürlichen Lärchenholzverkleidung für eine harmonische architektonische Integration.";
      if (locale === "nl") return nlText + " " + "Volledig configureerbaar, maakt het de combinatie mogelijk van een strakke witte afwerking of een natuurlijke larikshouten bekleding, wat een harmonieuze architectonische integratie biedt.";
    }

    if (locale === "en") return enText;
    if (locale === "de") return deText;
    if (locale === "nl") return nlText;
  }

  // 2. Template 2: Le modèle [X] avec Attique séduit par son design contemporain, ses volumes harmonieux... (conforme RE2020)
  if (description.includes("séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020)")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+avec Attique séduit/);
    const name = match ? match[1].trim() : "";

    if (locale === "en") return `The ${name} with Penthouse model appeals with its contemporary design, harmonious volumes, and robust timber frame structure with high thermal performance (RE2020 compliant). This contemporary modular home features a flat roof terrace with a penthouse, creating clean geometric lines that integrate perfectly into modern urban and residential environments.`;
    if (locale === "de") return `Das Modell ${name} mit Attika besticht durch sein zeitgenössisches Design, seine harmonischen Volumina und seine robuste Holzrahmenstruktur mit hoher thermischer Leistung (RE2020-konform). Dieses moderne Modulhaus verfügt über eine Flachdachterrasse mit Attika, die klare geometrische Linien schafft, die sich perfekt in moderne städtische und wohnliche Umgebungen einfügen.`;
    if (locale === "nl") return `Het ${name} met Attiek model spreekt aan met zijn eigentijdse design, harmonieuze volumes en robuuste houtskeletstructuur met hoge thermische prestaties (RE2020-conform). Dit eigentijdse modulaire huis beschikt over een plat dakterras met attiek, waardoor strakke geometrische lijnen ontstaan die perfect integreren in moderne stedelijke en residentiële omgevingen.`;
  }

  // 3. Template 3: Le modèle [X] avec Attique séduit par son design contemporain, ses volumes harmonieux... (no RE2020 mention)
  if (description.includes("séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique.")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+avec Attique séduit/);
    const name = match ? match[1].trim() : "";

    if (locale === "en") return `The ${name} with Penthouse model appeals with its contemporary design, harmonious volumes, and robust timber frame structure with high thermal performance.`;
    if (locale === "de") return `Das Modell ${name} mit Attika besticht durch sein zeitgenössisches Design, seine harmonischen Volumina und seine robuste Holzrahmenstruktur mit hoher thermischer Leistung.`;
    if (locale === "nl") return `Het ${name} met Attiek model spreekt aan met zijn eigentijdse design, harmonieuze volumes en robuuste houtskeletstructuur met hoge thermische prestaties.`;
  }

  // 4. Template 4: Le modèle [X] avec Attique/Toit allie architecture contemporaine, compacité / allie les espaces de vie...
  if (description.includes("allie les espaces de vie spacieux et ouverts de plain-pied")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+avec/);
    const name = match ? match[1].trim() : "";
    if (locale === "en") return `The ${name} with Roof model combines the spacious and open single-story living spaces of the ${name} range with the timeless charm of a double-pitch roof.`;
    if (locale === "de") return `Das Modell ${name} mit Dach verbindet die großzügigen und offenen einstöckigen Wohnräume der Reihe ${name} mit dem zeitlosen Charme eines Satteldachs.`;
    if (locale === "nl") return `Het ${name} met Dak model combineert de ruime en open gelijkvloerse leefruimtes van de ${name}-serie met de tijdloze charme van een zadeldak.`;
  }

  if (description.includes("allie à la perfection l'optimisation des espaces de vie de plain-pied et l'élégance traditionnelle d'une toiture à double pente")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+avec/);
    const name = match ? match[1].trim() : "";
    if (locale === "en") return `The ${name} with Roof model perfectly combines single-story living space optimization with the traditional elegance of a double-pitch roof. Designed with a high-performance timber frame and advanced thermal insulation compliant with RE2020, it offers a healthy, bright, and sustainable living environment.`;
    if (locale === "de") return `Das Modell ${name} mit Dach verbindet perfekt die Optimierung des einstöckigen Wohnraums mit der traditionellen Eleganz eines Satteldachs. Entworfen mit einem Hochleistungs-Holzrahmen und fortschrittlicher Dämmung konform mit RE2020, bietet es ein gesundes, helles und nachhaltiges Wohnumfeld.`;
    if (locale === "nl") return `Het ${name} met Dak model combineert perfect de optimalisatie van gelijkvloerse leefruimtes met de traditionele elegantie van een zadeldak. Ontworpen met een hoogwaardig houtskelet en geavanceerde thermische isolatie conform RE2020, biedt het een gezonde, lichte en duurzame leefomgeving.`;
  }

  // 5. Template 5: Le modèle [X] allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente...
  if (description.includes("allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables")) {
    const match = description.match(/Le modèle\s+([^,]+)\s+allie/);
    const name = match ? match[1].trim() : slug.replace("-house-comble", "").replace("-comble", "").replace("-house", "");
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const enText = `The ${capitalizedName} model combines traditional charm with energy performance. With its steep roof housing a convertible loft, it offers optimal layout flexibility.`;
    const deText = `Das Modell ${capitalizedName} verbindet traditionellen Charme mit Energieeffizienz. Mit seinem Steildach, das ein ausbaubares Dachgeschoss beherbergt, bietet es optimale Flexibilität bei der Gestaltung.`;
    const nlText = `Het ${capitalizedName} model combineert traditionele charme met energieprestaties. Met zijn steile dak waarin een inrichtbare zolder is ondergebracht, biedt het een optimale flexibiliteit in indeling.`;

    const extraElegance = "sa structure robuste en ossature bois à haute efficacité thermique garantit un confort de vie inégalé en toutes saisons.";
    if (description.includes(extraElegance)) {
      if (locale === "en") return enText + " " + "Its robust timber frame structure with high thermal efficiency guarantees unequalled living comfort in all seasons.";
      if (locale === "de") return deText + " " + "Seine robuste Holzrahmenstruktur mit hoher thermischer Effizienz garantiert unübertroffenen Wohnkomfort zu allen Jahreszeiten.";
      if (locale === "nl") return nlText + " " + "De robuuste houtskeletstructuur met hoge thermische efficiëntie garandeert een ongeëvenaard leefcomfort in alle seizoenen.";
    }

    if (locale === "en") return enText;
    if (locale === "de") return deText;
    if (locale === "nl") return nlText;
  }

  return description;
}
