'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useCartInfo from '@/hooks/use-cart-info';
import useGuestCartNavigation from '@/hooks/useGuestCartNavigation';
import {
  add_cart_product,
  closeCartMini,
  openCartMini,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface CartItem {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  price: number | string;
  discount?: number | string;
  orderQuantity: number;
}

export default function CartMiniSheet(): React.ReactElement {
  const dispatch = useDispatch();
  const { navigateToCart, navigateToCheckout } = useGuestCartNavigation();
  const { subtotal, total, firstTimeDiscountAmount } = useCartInfo();

  const {
    cart_products,
    cartMiniOpen,
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
  } = useSelector((s: any) => s.cart);

  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    (s: any) => s.coupon ?? {}
  );

  const { address_discount_eligible = false, address_discount_percentage = 0 } =
    useSelector((s: any) => s.order ?? {});

  const discountPercentage =
    Number(shippingDiscount) > 0
      ? String(Math.round(Number(shippingDiscount) * 100))
      : '0';

  const addressDiscountAmount = address_discount_eligible
    ? Number(subtotal || 0) * (Number(address_discount_percentage || 0) / 100)
    : 0;

  function calculateFinalTotal(): number {
    let finalTotal = Number(total || 0) + Number(totalShippingCost || 0);
    if (Number(total_coupon_discount) > 0) {
      finalTotal -= Number(total_coupon_discount);
    }
    if (addressDiscountAmount > 0) {
      finalTotal -= addressDiscountAmount;
    }
    // Important: Do not subtract firstTimeDiscountAmount here because it is
    // already reflected in `total` in the legacy logic. We still show the line item.
    return Math.max(0, finalTotal);
  }

  function handleOpenChange(next: boolean): void {
    if (next) dispatch(openCartMini());
    else dispatch(closeCartMini());
  }

  function handleRemove(item: CartItem): void {
    dispatch(remove_product({ title: item.title, id: item._id }));
  }

  function handleDecrement(item: CartItem): void {
    dispatch(quantityDecrement(item));
  }

  function handleIncrement(item: CartItem): void {
    dispatch(add_cart_product(item));
  }

  function renderLinePrice(item: CartItem): string {
    const base = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const unit = discount > 0 ? base - (base * discount) / 100 : base;
    const line = unit * Number(item.orderQuantity || 0);
    return line.toFixed(2);
  }

  const items: CartItem[] = Array.isArray(cart_products) ? cart_products : [];

  return (
    <Sheet open={Boolean(cartMiniOpen)} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[min(92vw,28rem)] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center justify-between text-base">
            <span>Shopping Cart</span>
            {/* {items.length > 0 && (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                {items.length}
              </span>
            )} */}
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {firstTimeDiscount?.isApplied && (
            <div className="mx-4 mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
              <span className="mr-1">🎉</span>
              First-time order discount applied (-
              {firstTimeDiscount?.percentage}
              %)!
            </div>
          )}
          <ScrollArea className="flex-1 px-4 py-3">
            {items.length === 0 ? (
              <div className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
                Your cart is empty
              </div>
            ) : (
              <div className="grid gap-3">
                {items.map((item: CartItem, index: number) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="grid grid-cols-[64px_1fr_auto] gap-3 rounded-lg border border-border/60 p-2"
                  >
                    <Link
                      href={`/product/${item.slug || item._id}`}
                      className="relative h-16 w-16 overflow-hidden rounded-md bg-muted"
                      aria-label={item.title}
                    >
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug || item._id}`}
                        className="line-clamp-2 text-sm font-medium"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="inline-flex items-center rounded-full border px-2 py-0.5">
                          Qty
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                            onClick={() => handleDecrement(item)}
                            disabled={item.orderQuantity <= 1}
                          >
                            −
                          </button>
                          <span className="w-6 text-center">
                            {item.orderQuantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                            onClick={() => handleIncrement(item)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item)}
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        Remove
                      </button>
                      <div className="text-sm font-semibold">
                        ${renderLinePrice(item)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>
                $
                {Number(
                  firstTimeDiscount?.isApplied ? subtotal : total || 0
                ).toFixed(2)}
              </span>
            </div>
            {firstTimeDiscount?.isApplied && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>
                  First-time discount (-{firstTimeDiscount?.percentage}%)
                </span>
                <span>-${Number(firstTimeDiscountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>
                ${Number(totalShippingCost || 0).toFixed(2)}
                {Number(discountPercentage) > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {discountPercentage}% off
                  </span>
                )}
              </span>
            </div>
            {Number(total_coupon_discount) > 0 && (
              <div className="flex items-center justify-between">
                <span>
                  Coupon Discounts
                  {Array.isArray(applied_coupons) &&
                    applied_coupons.length > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({applied_coupons.length} coupons)
                      </span>
                    )}
                </span>
                <span>- ${Number(total_coupon_discount).toFixed(2)}</span>
              </div>
            )}
            {addressDiscountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span>Address Discount</span>
                <span>- ${addressDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>${calculateFinalTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                dispatch(closeCartMini());
                navigateToCart();
              }}
            >
              View Cart
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                dispatch(closeCartMini());
                navigateToCheckout();
              }}
            >
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
