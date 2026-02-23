import type { CartItemType } from './cart-types';

/**
 * Compute line total for a cart item (price × quantity).
 * Rounds unit price to 2 decimals to avoid floating-point precision issues.
 */
export function getCartItemLineTotal(item: CartItemType): string {
  const rawPrice = Number(item.finalPriceDiscount ?? item.price ?? 0);
  const unitPrice = Math.round(rawPrice * 100) / 100;
  const qty = Number(item.orderQuantity || 0);
  const lineTotal = Math.round(unitPrice * qty * 100) / 100;
  return lineTotal.toFixed(2);
}

/**
 * Build product href from cart item.
 */
export function getCartItemProductHref(item: CartItemType): string {
  return `/product/${item.slug || item._id}`;
}
