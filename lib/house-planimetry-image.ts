/** Approved 3D floor-plan visuals; other houses retain their existing plans. */
const planimetryImages: Readonly<Record<string, string>> = {
  "a-frame-house": "/images/planimetries/a-frame-house-3d-20261021.webp",
};

export function getHousePlanimetryImage(slug: string, fallback: string): string {
  return planimetryImages[slug] || fallback;
}
