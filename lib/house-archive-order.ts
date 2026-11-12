import { hasGeneratedHousePlanimetry } from "./house-planimetry-image";

/** Order one category, preserving CMS order within each availability group. */
export function sortHousesForArchive<T extends { slug: string }>(houses: readonly T[]): T[] {
  const ordered = [...houses].sort(
    (a, b) => Number(hasGeneratedHousePlanimetry(b.slug)) - Number(hasGeneratedHousePlanimetry(a.slug))
  );
  const eneaIndex = ordered.findIndex((house) => house.slug === "enea" || house.slug.startsWith("enea-"));
  if (eneaIndex !== -1) {
    const [enea] = ordered.splice(eneaIndex, 1);
    ordered.splice(Math.max(ordered.length - 1, 0), 0, enea);
  }
  return ordered;
}
