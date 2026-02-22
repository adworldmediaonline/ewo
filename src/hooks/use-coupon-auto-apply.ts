'use client';

import { useCallback } from 'react';
import { clearUserRemoved } from '@/lib/coupon-user-removed';

/**
 * When auto apply is ON, the discount is already applied at product level
 * (product cards add with discounted price via useProductCoupon).
 * Cart-level auto apply is skipped to avoid double-counting.
 * This hook still exposes retryAutoApply for components that reference it.
 */
export function useCouponAutoApply() {
  const retryAutoApply = useCallback(() => {
    clearUserRemoved();
  }, []);

  return { retryAutoApply };
}
