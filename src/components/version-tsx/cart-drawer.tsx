'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import useCartInfo from '@/hooks/use-cart-info';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { useCartActions } from '@/hooks/use-cart-actions';
import {
  CartDrawerHeader,
  CartEmptyState,
  CartItemCard,
  OrderSummaryCard,
  ShippingBenefitsBanner,
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
  const { cart_products } = useSelector(
    (s: { cart: { cart_products: CartItemType[] } }) => s.cart
  );
  const { quantity } = useCartInfo();
  const summary = useCartSummary({ refetchWhen: open });
  const { handleIncrement, handleDecrement, handleRemove } = useCartActions();

  const items = Array.isArray(cart_products) ? cart_products : [];

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
              {(summary.qualifiesForFreeShipping ||
                summary.gapToFreeShipping != null ||
                (summary.shippingDiscountPercent != null && summary.shippingDiscountPercent > 0)) && (
                <ShippingBenefitsBanner
                  qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
                  progressPercent={summary.progressPercent}
                  gapToFreeShipping={summary.gapToFreeShipping ?? undefined}
                  shippingDiscountPercent={summary.shippingDiscountPercent}
                  itemCount={summary.quantity}
                />
              )}
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
            <OrderSummaryCard
              variant="sidebar"
              subtotal={summary.subtotal}
              discountAmount={summary.discountAmount}
              couponCode={summary.couponCode}
              effectiveShippingCost={summary.effectiveShippingCost}
              qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
              displayTotal={summary.displayTotal}
              isAutoApplied={summary.isAutoApplied}
              shippingDiscountPercent={summary.shippingDiscountPercent}
            />

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
