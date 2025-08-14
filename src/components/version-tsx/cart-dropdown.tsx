'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useCartInfo from '@/hooks/use-cart-info';
import useGuestCartNavigation from '@/hooks/useGuestCartNavigation';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { X as XIcon } from 'lucide-react';

interface CartItem {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  price: number | string;
  discount?: number | string;
  orderQuantity: number;
}

export default function CartDropdown({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const dispatch = useDispatch();
  const { subtotal, total, firstTimeDiscountAmount } = useCartInfo();
  const { navigateToCart, navigateToCheckout } = useGuestCartNavigation();

  const {
    cart_products,
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
  } = useSelector((s: any) => s.cart);
  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    (s: any) => s.coupon ?? {}
  );

  const items: CartItem[] = Array.isArray(cart_products) ? cart_products : [];

  function handleIncrement(item: CartItem): void {
    dispatch(add_cart_product(item));
  }
  function handleDecrement(item: CartItem): void {
    dispatch(quantityDecrement(item));
  }
  function handleRemove(item: CartItem): void {
    dispatch(remove_product({ title: item.title, id: item._id }));
  }

  function renderLinePrice(item: CartItem): string {
    const base = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const unit = discount > 0 ? base - (base * discount) / 100 : base;
    return (unit * Number(item.orderQuantity || 0)).toFixed(2);
  }

  const discountPercentage =
    Number(shippingDiscount) > 0
      ? String(Math.round(Number(shippingDiscount) * 100))
      : '0';

  const finalTotal = React.useMemo(() => {
    const baseTotal = Number(total || 0);
    const shipping = Number(totalShippingCost || 0);
    const coupon = Number(total_coupon_discount || 0);
    return Math.max(0, baseTotal + shipping - coupon);
  }, [total, totalShippingCost, total_coupon_discount]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,26rem)] rounded-xl border border-border bg-popover p-0 shadow-xl z-[2147483647]"
      >
        {items.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm font-semibold">
                My Cart ({items.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={navigateToCart}
              >
                View all
              </Button>
            </div>

            {/* Items */}
            <div className="max-h-80 overflow-auto p-3 pr-1 grid gap-3">
              {items.map((item, idx) => (
                <div
                  key={`${item._id}-${idx}`}
                  className="grid grid-cols-[56px_1fr_auto] items-start gap-3 rounded-lg border border-border/60 bg-background p-2"
                >
                  <Link
                    href={`/product/${item.slug || item._id}`}
                    className="relative h-14 w-14 overflow-hidden rounded-md bg-muted"
                    aria-label={item.title}
                  >
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="56px"
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
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {Number(item.discount || 0) > 0 && (
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Disc {Number(item.discount)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                        onClick={() => handleDecrement(item)}
                        disabled={item.orderQuantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">
                        {item.orderQuantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                        onClick={() => handleIncrement(item)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item)}
                    >
                      <XIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <div className="text-sm font-semibold">
                      ${renderLinePrice(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Summary (no separators) */}
            <div className="px-3 py-3 space-y-2 text-sm">
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
                  <span>
                    -${Number(firstTimeDiscountAmount || 0).toFixed(2)}
                  </span>
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
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={navigateToCart}
                  className="w-full"
                >
                  View Cart
                </Button>
                <Button onClick={navigateToCheckout} className="w-full">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
