/**
 * Quantity-only stock logic.
 * Out of stock = quantity is 0 or undefined. Single source of truth for purchase blocking.
 */

export function isOutOfStock(
  product: { quantity?: number | null } | null | undefined
): boolean {
  return (Number(product?.quantity) ?? 0) <= 0;
}
