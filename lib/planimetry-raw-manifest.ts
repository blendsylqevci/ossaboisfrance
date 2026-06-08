/**
 * Maps files in public/planimetries-raw/ → Payload house slug(s).
 * Same planimetry PNG is linked to attique + me-kulm variants when floor plan matches.
 */
export type PlanimetryRawEntry = {
  filename: string;
  slugs: string[];
};

export const PLANIMETRY_RAW_MANIFEST: PlanimetryRawEntry[] = [
  {
    filename: "A FRAME HOUSE.png",
    slugs: ["a-frame-house", "a-frame-house-me-kulm"],
  },
  {
    filename: "AMBRE.png",
    slugs: ["ambre-avec-attique", "ambre-me-kulm"],
  },
  {
    filename: "ASEBRA.png",
    slugs: ["asebra-avec-attique", "asebra-me-kulm"],
  },
  {
    filename: "BOREALE.png",
    slugs: ["boreale-avec-attique"],
  },
  {
    filename: "CALME.png",
    slugs: ["calme-avec-attique", "maison-calme"],
  },
  {
    filename: "COTTAGE.png",
    slugs: ["cotage-toiture-terrasse"],
  },
  {
    filename: "DIADEME.png",
    slugs: ["diademe-toiture-terrasse"],
  },
  {
    filename: "EMERAUDE.png",
    slugs: ["emeraude-avec-attique", "emeraude-me-kulm"],
  },
  {
    filename: "ESCAPE VILLA.png",
    slugs: ["escape-villa-avec-attique"],
  },
  {
    filename: "FLORA.png",
    slugs: ["flora-avec-attique"],
  },
  {
    filename: "FOREST SIDE CABIN.png",
    slugs: ["forest-side-cabin-avec-attique"],
  },
  {
    filename: "L SHAPED HOUSE.png",
    slugs: ["maison-en-l-avec-attique"],
  },
  {
    filename: "MAISON E.png",
    slugs: ["maison-e"],
  },
  {
    filename: "MAISON LOREN.png",
    slugs: ["maison-loren"],
  },
  {
    filename: "MARINELA.png",
    slugs: ["marinela-avec-attique"],
  },
  {
    filename: "MEDIALUNA.png",
    slugs: ["medialuna"],
  },
  {
    filename: "MELODIE.png",
    slugs: ["melodie-avec-attique"],
  },
  {
    filename: "MONNA.png",
    slugs: ["monna-avec-attique"],
  },
  {
    filename: "REGENCE.png",
    slugs: ["regence-avec-attique"],
  },
  {
    filename: "SYMPHONIE.png",
    slugs: ["symphonie-avec-attique"],
  },
];
