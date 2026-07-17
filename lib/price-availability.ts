/**
 * CMS imports use `1` as an explicit marker until a house price is approved.
 * Keep that marker out of every public price calculation and checkout path.
 */
export const UNPUBLISHED_HOUSE_PRICE_MARKER = 1;

export function isPublishedHousePrice(
  price: number | null | undefined
): price is number {
  return (
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > UNPUBLISHED_HOUSE_PRICE_MARKER
  );
}
