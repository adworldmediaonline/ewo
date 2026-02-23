'use client';

import Link from 'next/link';
import { useCartSummary } from '@/hooks/use-cart-summary';
import {
  OrderSummaryCard,
  ShippingBenefitsBanner,
  AutoApplySavingsBanner,
} from '@/components/version-tsx/cart';

export default function CartCheckout() {
  const summary = useCartSummary();

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 border-b pb-4">
        <h3 className="text-xl font-bold">Order Summary</h3>
      </div>

      {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
        (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
        <div className="mb-4">
          <AutoApplySavingsBanner
            percent={
              summary.productLevelSavings > 0
                ? summary.productLevelPercent
                : summary.autoApplyPercent
            }
            couponCode={summary.appliedCouponCode ?? summary.couponCode}
          />
        </div>
      )}

      {(summary.qualifiesForFreeShipping ||
        summary.gapToFreeShipping != null ||
        (summary.shippingDiscountPercent != null && summary.shippingDiscountPercent > 0)) && (
        <div className="mb-4">
          <ShippingBenefitsBanner
            qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
            progressPercent={summary.progressPercent}
            gapToFreeShipping={summary.gapToFreeShipping ?? undefined}
            shippingDiscountPercent={summary.shippingDiscountPercent}
            itemCount={summary.quantity}
          />
        </div>
      )}

      <OrderSummaryCard
        variant="inline"
        subtotal={summary.subtotal}
        discountAmount={summary.discountAmount}
        couponCode={summary.couponCode}
        effectiveShippingCost={summary.effectiveShippingCost}
        qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
        displayTotal={summary.displayTotal}
        isAutoApplied={summary.isAutoApplied}
        shippingDiscountPercent={summary.shippingDiscountPercent}
      />

      <div className="mt-6">
        <Link
          href="/checkout"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-md py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
