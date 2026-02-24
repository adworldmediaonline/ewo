/**
 * Shared product pricing logic.
 * finalPriceDiscount is the single source of truth.
 * Marked price = original base price. Final price = price after all discounts.
 */

export interface ProductPriceInput {
  price?: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  displayPrice?: number;
  displayMarkedPrice?: number;
  hasDisplayDiscount?: boolean;
}

export interface ProductDisplayPrices {
  /** Final price to display (after all discounts) */
  finalPrice: number;
  /** Marked price (original base) - undefined when no discount to show */
  markedPrice: number | undefined;
  /** Whether to show marked price (strikethrough) */
  showMarkedPrice: boolean;
}

/**
 * Get display prices for a product.
 * Uses displayPrice/displayMarkedPrice when present (from server enrichment).
 * Otherwise computes from finalPriceDiscount (single source of truth).
 */
export function getProductDisplayPrices(
  product: ProductPriceInput,
  options?: {
    optionPrice?: number;
    couponPercentage?: number;
  }
): ProductDisplayPrices {
  const optionPrice = options?.optionPrice ?? 0;
  const couponPercentage = options?.couponPercentage ?? 0;

  // Pre-computed from server enrichment
  if (
    typeof product.displayPrice === "number" &&
    product.displayPrice >= 0
  ) {
    const finalPrice = product.displayPrice + optionPrice;
    const markedPrice =
      typeof product.displayMarkedPrice === "number"
        ? product.displayMarkedPrice + optionPrice
        : undefined;
    const showMarkedPrice =
      (product.hasDisplayDiscount ?? false) && markedPrice != null && markedPrice > finalPrice;
    return {
      finalPrice,
      markedPrice: showMarkedPrice ? markedPrice : undefined,
      showMarkedPrice,
    };
  }

  // Fallback: compute from finalPriceDiscount (single source of truth)
  const mainPrice = Number(product.finalPriceDiscount ?? product.price ?? 0);
  const originalBasePrice = Number(
    product.price ?? product.updatedPrice ?? mainPrice
  );

  let finalPrice = mainPrice;
  if (couponPercentage > 0) {
    finalPrice = Math.round(mainPrice * (1 - couponPercentage / 100) * 100) / 100;
  }
  finalPrice += optionPrice;

  const hasProductDiscount = mainPrice > 0 && mainPrice < originalBasePrice;
  const hasCouponDiscount = couponPercentage > 0;
  const showMarkedPrice = hasProductDiscount || hasCouponDiscount;
  const markedPrice = showMarkedPrice
    ? originalBasePrice + optionPrice
    : undefined;

  return {
    finalPrice,
    markedPrice: markedPrice != null && markedPrice > finalPrice ? markedPrice : undefined,
    showMarkedPrice: showMarkedPrice && (markedPrice == null || markedPrice > finalPrice),
  };
}

/**
 * Format price for display (2 decimals).
 */
export function formatPrice(value: number): string {
  return value.toFixed(2);
}
