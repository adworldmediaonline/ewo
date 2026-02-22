'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import useCartInfo from '@/hooks/use-cart-info';
import { useCartSummary } from '@/hooks/use-cart-summary';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import {
  CartDrawerHeader,
  CartEmptyState,
  CartItemCard,
  OrderSummaryCard,
  FreeShippingProgressBanner,
  AutoApplySavingsBanner,
  getCartItemLineTotal,
  getCartItemProductHref,
} from '@/components/version-tsx/cart';
import { ArrowRightIcon } from 'lucide-react';
import type { CartItemType } from '@/components/version-tsx/cart';

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const dispatch = useDispatch();
  const { cart_products } = useSelector(
    (s: { cart: { cart_products: CartItemType[] } }) => s.cart
  );
  const { quantity } = useCartInfo();
  const summary = useCartSummary();

  const items = Array.isArray(cart_products) ? cart_products : [];

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

  const closeDrawer = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <CartDrawerHeader itemCount={quantity} />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <CartEmptyState onBrowseClick={closeDrawer} />
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <CartItemCard
                  key={`${item._id}-${idx}`}
                  item={item}
                  lineTotal={getCartItemLineTotal(item)}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                  productHref={getCartItemProductHref}
                  onProductClick={closeDrawer}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t border-border/60 bg-muted/20 px-5 py-5">
            {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
              (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
              <AutoApplySavingsBanner
                percent={
                  summary.productLevelSavings > 0
                    ? summary.productLevelPercent
                    : summary.autoApplyPercent
                }
                couponCode={summary.appliedCouponCode ?? summary.couponCode}
              />
            )}
            <OrderSummaryCard
              subtotal={summary.subtotal}
              discountAmount={summary.discountAmount}
              couponCode={summary.couponCode}
              effectiveShippingCost={summary.effectiveShippingCost}
              qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
              displayTotal={summary.displayTotal}
              isAutoApplied={summary.isAutoApplied}
            />

            {summary.gapToFreeShipping != null &&
              summary.gapToFreeShipping > 0 &&
              summary.freeShippingThreshold != null &&
              summary.freeShippingThreshold > 0 && (
                <FreeShippingProgressBanner
                  progressPercent={summary.progressPercent}
                  gapToFreeShipping={summary.gapToFreeShipping}
                />
              )}

            <Button
              asChild
              className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg"
              size="lg"
            >
              <Link href="/checkout" onClick={closeDrawer}>
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
