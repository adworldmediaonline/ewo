'use client';

import { useEffect, useState } from 'react';
import {
  getStoreCouponSettings,
  getAvailableOffers,
  pickBestOffer,
} from '@/lib/store-api';

export interface UseProductCouponResult {
  hasCoupon: boolean;
  couponPercentage: number;
  couponCode: string | null;
  discountedPrice: number | null;
}

/**
 * Returns coupon info for a product when auto-apply is enabled.
 * When auto-apply is ON: fetches best offer for this product and returns discounted price.
 * When auto-apply is OFF: returns no coupon (prices display at full).
 * Refetches when refetchKey changes (e.g. from useRefetchOnVisibility for admin updates).
 */
export function useProductCoupon(
  productId: string,
  unitPrice: number,
  refetchKey?: number
): UseProductCouponResult {
  const [result, setResult] = useState<UseProductCouponResult>({
    hasCoupon: false,
    couponPercentage: 0,
    couponCode: null,
    discountedPrice: null,
  });

  useEffect(() => {
    if (!productId || unitPrice <= 0) {
      setResult({
        hasCoupon: false,
        couponPercentage: 0,
        couponCode: null,
        discountedPrice: null,
      });
      return;
    }

    let cancelled = false;

    getStoreCouponSettings()
      .then((settings) => {
        if (cancelled) return;
        if (
          !settings.autoApply ||
          settings.autoApplyStrategy === 'customer_choice'
        ) {
          setResult({
            hasCoupon: false,
            couponPercentage: 0,
            couponCode: null,
            discountedPrice: null,
          });
          return;
        }

        const subtotal = unitPrice;
        const items = [
          {
            productId,
            quantity: 1,
            unitPrice,
          },
        ];

        return getAvailableOffers(subtotal, items).then((offers) => {
          if (cancelled) return;
          const strategy = settings.autoApplyStrategy;
          const best =
            strategy === 'customer_choice'
              ? null
              : pickBestOffer(offers, strategy);

          if (!best || best.discountAmount <= 0) {
            setResult({
              hasCoupon: false,
              couponPercentage: 0,
              couponCode: null,
              discountedPrice: null,
            });
            return;
          }

          const discountedPrice = Math.max(
            0,
            Math.round((unitPrice - best.discountAmount) * 100) / 100
          );
          const couponPercentage =
            unitPrice > 0
              ? Math.round((best.discountAmount / unitPrice) * 100)
              : 0;

          setResult({
            hasCoupon: true,
            couponPercentage,
            couponCode: best.code,
            discountedPrice,
          });
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            hasCoupon: false,
            couponPercentage: 0,
            couponCode: null,
            discountedPrice: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productId, unitPrice, refetchKey]);

  return result;
}
