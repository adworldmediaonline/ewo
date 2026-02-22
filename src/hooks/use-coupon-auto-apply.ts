'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getStoreCouponSettings,
  getAvailableOffers,
  validateStoreDiscount,
  pickBestOffer,
} from '@/lib/store-api';
import {
  loadUserRemoved,
  saveUserRemoved,
  clearUserRemoved,
} from '@/lib/coupon-user-removed';
import { applyCoupon } from '@/redux/features/cartSlice';
import { notifySuccess } from '@/utils/toast';
import useCartInfo from './use-cart-info';

export function useCouponAutoApply() {
  const dispatch = useDispatch();
  const { cart_products, couponCode, discountAmount } = useSelector(
    (s: { cart: { cart_products: unknown[]; couponCode: string | null; discountAmount: number } }) => s.cart
  );
  const { subtotal, quantity } = useCartInfo();
  const autoApplyInProgress = useRef(false);
  const [autoApplyRetry, setAutoApplyRetry] = useState(0);

  const retryAutoApply = useCallback(() => {
    clearUserRemoved();
    setAutoApplyRetry((r) => r + 1);
  }, []);

  useEffect(() => {
    if (
      !cart_products?.length ||
      subtotal <= 0 ||
      couponCode != null ||
      autoApplyInProgress.current
    ) {
      return;
    }

    const removed = loadUserRemoved();
    const itemCount = quantity;
    if (removed && removed.itemCount === itemCount && removed.subtotal === subtotal) {
      return;
    }

    autoApplyInProgress.current = true;
    const cartItems = (cart_products as Array<{ _id: string; orderQuantity: number; finalPriceDiscount?: number | string; price?: number | string }>).map(
      (i) => ({
        productId: i._id,
        quantity: i.orderQuantity,
        unitPrice: Number(i.finalPriceDiscount ?? i.price ?? 0),
      })
    );

    getStoreCouponSettings()
      .then((settings) => {
        if (
          !settings.autoApply ||
          settings.autoApplyStrategy === 'customer_choice'
        ) {
          return null;
        }
        return getAvailableOffers(subtotal, cartItems).then((offers) => ({
          settings,
          offers,
        }));
      })
      .then((result) => {
        if (!result || !Array.isArray(result.offers)) return;
        const { settings, offers } = result;
        const strategy = settings.autoApplyStrategy;
        const best =
          strategy === 'customer_choice'
            ? null
            : pickBestOffer(offers, strategy);
        if (!best) return;

        return validateStoreDiscount(best.code, subtotal, cartItems).then(
          (validationResult) => {
            if (validationResult.valid) {
              dispatch(
                applyCoupon({
                  code: best.code.trim().toUpperCase(),
                  discountAmount: validationResult.discountAmount,
                  isAutoApplied: true,
                })
              );
              if (settings.showToastOnApply) {
                const pct =
                  subtotal > 0
                    ? Math.round(
                        (validationResult.discountAmount / subtotal) * 100
                      )
                    : 0;
                notifySuccess(
                  `${best.code} applied – Save ${pct}% on your order`
                );
              }
            }
          }
        );
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        autoApplyInProgress.current = false;
      });
  }, [
    cart_products,
    subtotal,
    couponCode,
    quantity,
    autoApplyRetry,
    dispatch,
  ]);

  return { retryAutoApply };
}
