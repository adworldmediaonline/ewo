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
  variant?: 'card' | 'inline' | 'sidebar';
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
  const isSidebar = variant === 'sidebar';

  const lineItemClass = 'flex items-center justify-between';
  const labelClass = isSidebar
    ? 'text-sm font-normal text-muted-foreground'
    : 'text-sm text-muted-foreground';
  const valueClass = isSidebar
    ? 'text-sm font-normal tabular-nums text-foreground'
    : 'text-sm font-semibold tabular-nums text-foreground';

  const lineItems = (
    <div className={isSidebar ? 'space-y-4' : 'space-y-3'}>
      <div className={lineItemClass}>
        <span className={labelClass}>Subtotal</span>
        <span className={valueClass}>
          {currencySymbol}{subtotal.toFixed(2)}
        </span>
      </div>
      {discountAmount > 0 && !isAutoApplied && (
        <div className={`${lineItemClass} text-emerald-600 dark:text-emerald-400`}>
          <span className="text-sm font-normal">
            Discount{couponCode ? ` (${couponCode})` : ''}
          </span>
          <span className="text-sm font-normal tabular-nums">
            -{currencySymbol}{discountAmount.toFixed(2)}
          </span>
        </div>
      )}
      {effectiveShippingCost > 0 && (
        <div className={lineItemClass}>
          <span className={labelClass}>Shipping</span>
          <span className={valueClass}>
            {currencySymbol}{effectiveShippingCost.toFixed(2)}
          </span>
        </div>
      )}
      {qualifiesForFreeShipping && (
        <div className={`${lineItemClass} text-emerald-600 dark:text-emerald-400`}>
          <span className="text-sm font-normal">Shipping</span>
          <span className="text-sm font-semibold">Free</span>
        </div>
      )}
    </div>
  );

  const totalLabel = 'Total';
  const totalAmountFormatted = `${currencySymbol}${displayTotal.toFixed(2)}`;

  const totalSection = isSidebar ? (
    <>
      <div
        className="my-5 border-t-2 border-dashed border-border"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground">{totalLabel}</span>
        <span className="text-base font-bold tabular-nums text-foreground">
          {totalAmountFormatted}
        </span>
      </div>
    </>
  ) : (
    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
      <span className="text-base font-bold text-foreground">{totalLabel}</span>
      <span className="text-xl font-bold tabular-nums text-foreground">
        {totalAmountFormatted}
      </span>
    </div>
  );

  const content = (
    <>
      {isSidebar && (
        <h3 className="mb-5 text-lg font-bold tracking-tight text-foreground">
          Order Summary
        </h3>
      )}
      {lineItems}
      {totalSection}
    </>
  );

  if (variant === 'inline') {
    return <>{content}</>;
  }

  if (variant === 'sidebar') {
    return (
      <div className="w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      {content}
    </div>
  );
}
