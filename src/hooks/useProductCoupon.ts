/**
 * Stub hook - coupon functionality removed.
 * Returns no coupon so prices display without coupon discounts.
 * Will be reimplemented using reference project best practices.
 */
export function useProductCoupon(_productId: string) {
  return {
    hasCoupon: false,
    couponPercentage: 0,
  };
}
