'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useCartInfo from '@/hooks/use-cart-info';
import { getStoreShippingSettings } from '@/lib/store-api';
import type { CartItemType, CartSummary } from '@/components/version-tsx/cart/cart-types';

type CartState = {
  cart_products: CartItemType[];
  couponCode: string | null;
  discountAmount: number;
  isAutoApplied: boolean;
};

/**
 * Computes cart summary: subtotal, shipping, discount, total, free-shipping state.
 * Reusable across cart drawer, cart page, checkout order summary.
 */
export function useCartSummary(): CartSummary & { quantity: number } {
  const { subtotal, total, quantity } = useCartInfo();
  const { cart_products, couponCode, discountAmount, isAutoApplied } =
    useSelector((s: { cart: CartState }) => s.cart);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  const items = Array.isArray(cart_products) ? cart_products : [];
  const shippingFromCart = items.reduce(
    (sum, item) =>
      sum + (Number(item.shipping?.price ?? 0) * Number(item.orderQuantity || 0)),
    0
  );
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const qualifiesForFreeShipping =
    freeShippingThreshold != null &&
    freeShippingThreshold > 0 &&
    subtotalAfterDiscount >= freeShippingThreshold;
  const effectiveShippingCost = qualifiesForFreeShipping ? 0 : shippingFromCart;
  const displayTotal = subtotalAfterDiscount + effectiveShippingCost;
  const gapToFreeShipping =
    freeShippingThreshold != null &&
    freeShippingThreshold > 0 &&
    subtotalAfterDiscount < freeShippingThreshold
      ? Math.ceil(freeShippingThreshold - subtotalAfterDiscount)
      : null;
  const progressPercent =
    freeShippingThreshold != null && freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotalAfterDiscount / freeShippingThreshold) * 100))
      : 0;

  useEffect(() => {
    getStoreShippingSettings()
      .then((s) => setFreeShippingThreshold(s.freeShippingThreshold))
      .catch(() => setFreeShippingThreshold(null));
  }, []);

  const autoApplyPercent =
    isAutoApplied && subtotal > 0 && discountAmount > 0
      ? Math.round((discountAmount / subtotal) * 100)
      : 0;

  return {
    subtotal,
    subtotalAfterDiscount,
    discountAmount,
    couponCode,
    isAutoApplied,
    autoApplyPercent,
    shippingFromCart,
    qualifiesForFreeShipping,
    effectiveShippingCost,
    displayTotal,
    gapToFreeShipping,
    freeShippingThreshold,
    progressPercent,
    quantity,
  };
}
