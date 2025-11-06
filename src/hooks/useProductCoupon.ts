'use client';

import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import { useMemo } from 'react';

interface CouponInfo {
  hasCoupon: boolean;
  couponPercentage: number | null;
  couponCode: string | null;
  couponTitle: string | null;
}

/**
 * Hook to check if a product has an applicable coupon and get coupon details
 * @param productId - The product ID to check for applicable coupons
 * @returns CouponInfo object with coupon details
 */
export const useProductCoupon = (productId: string): CouponInfo => {
  const { data: activeCouponsData, isLoading, isError } = useGetAllActiveCouponsQuery({});

  const couponInfo = useMemo<CouponInfo>(() => {
    // Default state: no coupon
    const noCoupon: CouponInfo = {
      hasCoupon: false,
      couponPercentage: null,
      couponCode: null,
      couponTitle: null,
    };

    // Return early if loading, error, or no data
    if (isLoading || isError || !activeCouponsData?.success || !activeCouponsData?.data) {
      return noCoupon;
    }

    const coupons = activeCouponsData.data;

    // Find the first active coupon that applies to this product
    for (const coupon of coupons) {
      // Check if coupon is active
      if (coupon.status !== 'active') continue;

      // Check if coupon applies to products
      if (coupon.applicableType === 'product' || coupon.applicableType === 'all') {
        // If it's an "all" type coupon, it applies to all products
        if (coupon.applicableType === 'all') {
          return {
            hasCoupon: true,
            couponPercentage: coupon.discountPercentage || null,
            couponCode: coupon.couponCode || null,
            couponTitle: coupon.title || null,
          };
        }

        // For product-specific coupons, check if this product is in the applicable list
        if (
          coupon.applicableProducts &&
          Array.isArray(coupon.applicableProducts) &&
          coupon.applicableProducts.length > 0
        ) {
          const isApplicable = coupon.applicableProducts.some(
            (product: any) => product._id === productId || product === productId
          );

          if (isApplicable) {
            return {
              hasCoupon: true,
              couponPercentage: coupon.discountPercentage || null,
              couponCode: coupon.couponCode || null,
              couponTitle: coupon.title || null,
            };
          }
        }
      }

      // Check category-based coupons
      if (coupon.applicableType === 'category' && coupon.applicableCategories?.length > 0) {
        // Note: We would need the product's category to check this
        // For now, we skip category-based coupons in product cards
        continue;
      }

      // Check brand-based coupons
      if (coupon.applicableType === 'brand' && coupon.applicableBrands?.length > 0) {
        // Note: We would need the product's brand to check this
        // For now, we skip brand-based coupons in product cards
        continue;
      }
    }

    return noCoupon;
  }, [activeCouponsData, isLoading, isError, productId]);

  return couponInfo;
};

