'use client';

export interface OrderSummaryCardProps {
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  effectiveShippingCost: number;
  qualifiesForFreeShipping: boolean;
  displayTotal: number;
  currencySymbol?: string;
  /** When true, discount was auto-applied - hide discount line (shown in AutoApplySavingsBanner) */
  isAutoApplied?: boolean;
  /** When true, renders without card wrapper (for inline use in cart page, etc.) */
  variant?: 'card' | 'inline';
}

export function OrderSummaryCard({
  subtotal,
  discountAmount,
  couponCode,
  effectiveShippingCost,
  qualifiesForFreeShipping,
  displayTotal,
  currencySymbol = '$',
  isAutoApplied = false,
  variant = 'card',
}: OrderSummaryCardProps) {
  const content = (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {currencySymbol}{subtotal.toFixed(2)}
          </span>
        </div>
        {discountAmount > 0 && !isAutoApplied && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-sm font-medium">
              Discount{couponCode ? ` (${couponCode})` : ''}
            </span>
            <span className="text-sm font-bold tabular-nums">
              -{currencySymbol}{discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        {effectiveShippingCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {currencySymbol}{effectiveShippingCost.toFixed(2)}
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
          {currencySymbol}{displayTotal.toFixed(2)}
        </span>
      </div>
    </>
  );

  if (variant === 'inline') {
    return <>{content}</>;
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      {content}
    </div>
  );
}
