'use client';

import { CheckCircle2Icon } from 'lucide-react';

export interface AutoApplySavingsBannerProps {
  percent: number;
  /** Coupon code or name when available */
  couponCode?: string | null;
}

export function AutoApplySavingsBanner({
  percent,
  couponCode,
}: AutoApplySavingsBannerProps) {
  const displayCode = couponCode?.trim();
  const message = displayCode
    ? `${displayCode} applied successfully!`
    : 'Discount applied successfully!';

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">
            {message}
          </p>
          <p className="text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 text-sm">
            You&apos;re saving {percent}% on your order
          </p>
        </div>
      </div>
    </div>
  );
}
