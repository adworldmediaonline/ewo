'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { CldImage } from 'next-cloudinary';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import useCartInfo from '@/hooks/use-cart-info';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { getStoreShippingSettings } from '@/lib/store-api';
import {
  MinusIcon,
  PlusIcon,
  Trash2Icon,
  PackageIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

interface CartItemType {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  sku?: string;
  price?: number | string;
  finalPriceDiscount?: number | string;
  orderQuantity: number;
  selectedOption?: { title: string; price: number };
  shipping?: { price?: number };
}

const isCloudinaryUrl = (url?: string) =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes('/upload/');

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const dispatch = useDispatch();
  const { cart_products, couponCode, discountAmount } = useSelector(
    (s: { cart: { cart_products: CartItemType[]; couponCode: string | null; discountAmount: number } }) => s.cart
  );
  const { subtotal, total, quantity } = useCartInfo();
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  const items: CartItemType[] = Array.isArray(cart_products) ? cart_products : [];
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

  const handleIncrement = (item: CartItemType) => {
    dispatch(
      add_cart_product({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount ?? item.price,
        sku: item.sku ?? item._id,
      } as Parameters<typeof add_cart_product>[0])
    );
  };

  const handleDecrement = (item: CartItemType) => {
    dispatch(
      quantityDecrement({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount ?? item.price,
        sku: item.sku ?? item._id,
      } as Parameters<typeof quantityDecrement>[0])
    );
  };

  const handleRemove = (item: CartItemType) => {
    dispatch(remove_product({ title: item.title, id: item._id }));
  };

  const renderLinePrice = (item: CartItemType) => {
    const base = Number(item.finalPriceDiscount ?? item.price ?? 0);
    return (base * Number(item.orderQuantity || 0)).toFixed(2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header with accent */}
        <div className="border-b border-border/60 bg-linear-to-b from-muted/50 to-transparent px-5 pr-12 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBagIcon className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                  Your Cart
                </SheetTitle>
                <p className="text-muted-foreground text-sm">
                  {quantity} {quantity === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-linear-to-b from-muted/20 to-muted/5 p-10 text-center">
              <div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-muted/80">
                <PackageIcon className="text-muted-foreground size-10" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mt-2 max-w-[220px] text-sm leading-relaxed">
                Discover our products and add something special to your cart.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-6 min-h-12 rounded-xl px-6">
                <Link href="/shop" onClick={() => onOpenChange(false)}>
                  Browse products
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const imageUrl = item.img;
                const isCloudinaryImage = isCloudinaryUrl(imageUrl);
                const lineTotal = Number(renderLinePrice(item));
                return (
                  <div
                    key={`${item._id}-${idx}`}
                    className="group flex gap-4 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Link
                      href={`/product/${item.slug || item._id}`}
                      className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40"
                      aria-label={item.title}
                      onClick={() => onOpenChange(false)}
                    >
                      {imageUrl ? (
                        <CldImage
                          src={imageUrl}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform group-hover:scale-105"
                          preserveTransformations={isCloudinaryImage}
                          deliveryType={isCloudinaryImage ? undefined : 'fetch'}
                          loading="lazy"
                          fetchPriority="low"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug || item._id}`}
                        className="font-semibold text-foreground line-clamp-2 transition-colors hover:text-primary"
                        onClick={() => onOpenChange(false)}
                      >
                        {item.title}
                      </Link>
                      {item.selectedOption && (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {item.selectedOption.title} (+$
                          {Number(item.selectedOption.price).toFixed(2)})
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <div className="flex items-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDecrement(item)}
                            disabled={item.orderQuantity <= 1}
                            className="rounded-none hover:bg-muted/60"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="size-3" />
                          </Button>
                          <span className="min-w-7 px-1.5 text-center text-sm font-medium tabular-nums">
                            {item.orderQuantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleIncrement(item)}
                            className="rounded-none hover:bg-muted/60"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemove(item)}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-base font-bold tabular-nums text-foreground">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Order summary & CTA */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t border-border/60 bg-muted/20 px-5 py-5">
            {/* Order summary card */}
            <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    ${Number(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-sm font-medium">
                      Discount{couponCode ? ` (${couponCode})` : ''}
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {effectiveShippingCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      ${effectiveShippingCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {qualifiesForFreeShipping && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-sm font-medium">Shipping</span>
                    <span className="text-sm font-bold">Free</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-bold tabular-nums text-foreground">
                  ${displayTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Free shipping progress */}
            {gapToFreeShipping != null &&
              gapToFreeShipping > 0 &&
              freeShippingThreshold != null &&
              freeShippingThreshold > 0 && (
                <div className="rounded-xl border border-primary/25 bg-linear-to-br from-primary/10 to-primary/5 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20">
                      <TruckIcon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">
                        {(() => {
                          const pct = Math.round(
                            (subtotalAfterDiscount / freeShippingThreshold) * 100
                          );
                          if (pct >= 80) return "So close!";
                          if (pct >= 50) return "You're almost there!";
                          return "Unlock free shipping";
                        })()}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        Add ${gapToFreeShipping} more for free shipping
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      Math.round((subtotalAfterDiscount / freeShippingThreshold) * 100)
                    )}
                    className="mt-3 h-2"
                  />
                </div>
              )}

            <Button
              asChild
              className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg"
              size="lg"
            >
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                Proceed to Checkout
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
