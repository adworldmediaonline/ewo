'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import useCartInfo from '@/hooks/use-cart-info';
import { getStoreShippingSettings } from '@/lib/store-api';

interface CartProduct {
  _id: string;
  orderQuantity: number;
  shipping?: { price?: number };
}

export default function CartCheckout() {
  const { subtotal, total } = useCartInfo();
  const { cart_products, discountAmount, couponCode } = useSelector(
    (s: { cart: { cart_products: CartProduct[]; discountAmount: number; couponCode: string | null } }) => s.cart
  );
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

  useEffect(() => {
    getStoreShippingSettings()
      .then((s) => setFreeShippingThreshold(s.freeShippingThreshold))
      .catch(() => setFreeShippingThreshold(null));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
      <div className="border-b pb-4 mb-4">
        <h3 className="text-xl font-bold">Order Summary</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>
              Discount{couponCode ? ` (${couponCode})` : ''}
            </span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {effectiveShippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">
              ${effectiveShippingCost.toFixed(2)}
            </span>
          </div>
        )}

        {qualifiesForFreeShipping && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Shipping</span>
            <span>Free</span>
          </div>
        )}

        {gapToFreeShipping != null && gapToFreeShipping > 0 && (
          <p className="text-muted-foreground text-xs">
            Add ${gapToFreeShipping} more for free shipping
          </p>
        )}

        <div className="border-t border-border pt-3 mt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">
              ${displayTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background w-full py-2.5"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
