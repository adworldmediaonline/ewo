'use client';

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AvailableOffers } from './available-offers';
import { CouponInput } from './coupon-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, TagIcon } from 'lucide-react';

type CouponSectionProps = {
  subtotal: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number; title?: string }>;
  onApplied: (discountAmount: number, code: string) => void;
  appliedCode: string | null;
  appliedAmount: number;
  onRemove: () => void;
  onRetryAutoApply?: () => void;
  label?: string;
  customerEmail?: string | null;
  customerReferralCode?: string | null;
  /** When changed, refetches available offers (e.g. on visibility change for admin updates). */
  refetchKey?: number;
};

export function CouponSection({
  subtotal,
  items,
  onApplied,
  appliedCode,
  appliedAmount,
  onRemove,
  onRetryAutoApply,
  label = 'Coupon code',
  customerEmail,
  customerReferralCode,
  refetchKey,
}: CouponSectionProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleApplied = (amount: number, code: string) => {
    onApplied(amount, code);
    setOpen(false);
  };

  const handleCopy = async () => {
    if (!appliedCode) return;
    try {
      await navigator.clipboard.writeText(appliedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const savingsPercent =
    appliedCode && appliedAmount > 0 && subtotal > 0
      ? Math.round((appliedAmount / subtotal) * 100)
      : 0;

  const cartItems = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="shrink-0 whitespace-nowrap text-muted-foreground text-sm font-medium">
          {label}
        </span>
        {appliedCode && appliedAmount > 0 ? (
          <>
            <Badge
              variant="outline"
              className="shrink-0 border-green-500/30 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
            >
              {appliedCode} ({savingsPercent}% off)
            </Badge>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 min-w-0 px-1.5 text-xs"
                onClick={handleCopy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 min-w-0 px-1.5 text-xs"
                onClick={onRemove}
              >
                Remove
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 min-w-0 gap-0.5 px-1.5 text-xs"
                >
                  Change
                  <ChevronDownIcon
                    className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </>
        ) : (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 gap-1 px-2 text-muted-foreground hover:text-foreground"
            >
              <TagIcon className="size-4 shrink-0" />
              <span className="whitespace-nowrap">View offers</span>
              <ChevronDownIcon
                className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        )}
      </div>

      <CollapsibleContent>
        <div className="space-y-4 overflow-hidden rounded-lg border border-border/80 bg-muted/20 p-4">
          {customerEmail === null && (
            <p className="text-muted-foreground text-xs">
              Enter your email above to use first-order offers.
            </p>
          )}
          {!appliedCode &&
            onRetryAutoApply &&
            items.length > 0 &&
            subtotal > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onRetryAutoApply}
              >
                Check for auto-applied offers
              </Button>
            )}
          <AvailableOffers
            subtotal={subtotal}
            items={cartItems}
            onApplied={handleApplied}
            appliedCode={appliedCode}
            changeMode
            customerEmail={customerEmail}
            customerReferralCode={customerReferralCode}
            refetchKey={refetchKey}
          />
          <div className="space-y-2 min-w-0">
            <p className="text-muted-foreground shrink-0 text-sm font-medium">
              Have a different code?
            </p>
            <CouponInput
              subtotal={subtotal}
              items={items}
              onApplied={handleApplied}
              appliedCode={appliedCode}
              appliedAmount={appliedAmount}
              onRemove={() => {
                onRemove();
                setOpen(false);
              }}
              forceShowInput
              customerEmail={customerEmail}
              customerReferralCode={customerReferralCode}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
