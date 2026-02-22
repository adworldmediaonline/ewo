import type { CartItemType } from './cart-types';

/**
 * Compute line total for a cart item (price × quantity).
 */
export function getCartItemLineTotal(item: CartItemType): string {
  const base = Number(item.finalPriceDiscount ?? item.price ?? 0);
  return (base * Number(item.orderQuantity || 0)).toFixed(2);
}

/**
 * Build product href from cart item.
 */
export function getCartItemProductHref(item: CartItemType): string {
  return `/product/${item.slug || item._id}`;
}
