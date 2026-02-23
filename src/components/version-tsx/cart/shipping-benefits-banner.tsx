'use client';

import { CheckCircle2Icon, TruckIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface ShippingBenefitsBannerProps {
  /** When true, order qualifies for free shipping */
  qualifiesForFreeShipping: boolean;
  /** Progress toward free shipping (0–100) when threshold exists and not yet met */
  progressPercent?: number;
  /** Amount left to add for free shipping */
  gapToFreeShipping?: number;
  /** When a tier discount is applied (e.g. 50) */
  shippingDiscountPercent?: number | null;
  /** Cart item count (for tier message: "3 items") */
  itemCount: number;
  currencySymbol?: string;
}

function getProgressHeadline(percent: number): string {
  if (percent >= 80) return 'So close!';
  if (percent >= 50) return "You're almost there!";
  return 'Unlock free shipping';
}

/**
 * Unified shipping benefits banner. Handles:
 * - Free shipping unlocked (success state)
 * - Tier discount + progress toward free shipping
 * - Progress toward free shipping only
 *
 * Keeps messaging clear and non-confusing.
 */
export function ShippingBenefitsBanner({
  qualifiesForFreeShipping,
  progressPercent = 0,
  gapToFreeShipping,
  shippingDiscountPercent,
  itemCount,
  currencySymbol = '$',
}: ShippingBenefitsBannerProps) {
  const hasFreeShippingThreshold = gapToFreeShipping != null && gapToFreeShipping > 0;
  const showTierDiscount = shippingDiscountPercent != null && shippingDiscountPercent > 0 && itemCount > 0;

  if (qualifiesForFreeShipping) {
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/12 to-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
            <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">
              Free shipping unlocked
            </p>
            <p className="text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 text-sm">
              Your order qualifies for free shipping
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasFreeShippingThreshold && !showTierDiscount) {
    return null;
  }

  if (showTierDiscount && hasFreeShippingThreshold) {
    return (
      <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <TruckIcon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold text-foreground">
              {shippingDiscountPercent}% off shipping
            </p>
            <p className="text-muted-foreground text-sm">
              Add {currencySymbol}{gapToFreeShipping} more for free shipping
            </p>
            <Progress value={Math.min(100, progressPercent)} className="mt-2 h-1.5" />
          </div>
        </div>
      </div>
    );
  }

  if (showTierDiscount && !hasFreeShippingThreshold) {
    return (
      <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <TruckIcon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              {shippingDiscountPercent}% off shipping
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Applied for {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/4 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <TruckIcon className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-foreground">
            {getProgressHeadline(progressPercent)}
          </p>
          <p className="text-muted-foreground text-sm">
            Add {currencySymbol}{gapToFreeShipping} more for free shipping
          </p>
          <Progress value={Math.min(100, progressPercent)} className="mt-2 h-1.5" />
        </div>
      </div>
    </div>
  );
}
