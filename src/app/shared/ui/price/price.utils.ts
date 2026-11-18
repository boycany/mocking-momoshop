/**
 * Taiwanese discount notation: 80% of the list price is "8折", 57% is "5.7折".
 * Returns null when there is no meaningful discount.
 */
export function discountLabel(price: number, originalPrice: number | null): string | null {
  if (originalPrice === null || originalPrice <= 0 || price >= originalPrice) {
    return null;
  }
  const tenths = Math.round((price / originalPrice) * 100) / 10;
  return `${Number.isInteger(tenths) ? tenths.toFixed(0) : tenths.toFixed(1)}折`;
}
