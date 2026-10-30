/** Approved 3D floor-plan visuals; other houses retain their existing plans. */
const planimetryImages: Readonly<Record<string, string>> = {
  "a-frame-house": "/images/planimetries/a-frame-house-photoreal-20261021.webp",
  "symphonie-avec-attique": "/images/planimetries/symphonie-avec-attique-photoreal-20261022.webp",
  "regence-avec-attique": "/images/planimetries/regence-avec-attique-photoreal-20261022.webp",
  "monna-avec-attique": "/images/planimetries/monna-avec-attique-photoreal-20261022.webp",
  "melodie-avec-attique": "/images/planimetries/melodie-avec-attique-photoreal-20261022.webp",
  "marinela-avec-attique": "/images/planimetries/marinela-avec-attique-photoreal-20261022.webp",
};

export function getHousePlanimetryImage(slug: string, fallback: string): string {
  return planimetryImages[slug] || fallback;
}
