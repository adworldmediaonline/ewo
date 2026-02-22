/**
 * Cart item shape - used across cart drawer, cart page, checkout.
 */

export interface CartItemType {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  sku?: string;
  price?: number | string;
  finalPriceDiscount?: number | string;
  orderQuantity: number;
  selectedOption?: { title: string; price: number };
  shipping?: { price?: number };
}

/**
 * Computed cart summary - from useCartSummary hook.
 */
export interface CartSummary {
  subtotal: number;
  subtotalAfterDiscount: number;
  discountAmount: number;
  couponCode: string | null;
  isAutoApplied: boolean;
  autoApplyPercent: number;
  shippingFromCart: number;
  qualifiesForFreeShipping: boolean;
  effectiveShippingCost: number;
  displayTotal: number;
  gapToFreeShipping: number | null;
  freeShippingThreshold: number | null;
  progressPercent: number;
}
