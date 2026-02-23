'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateStoreDiscount } from '@/lib/store-api';
import { CopyIcon, Loader2Icon } from 'lucide-react';

type CouponInputProps = {
  subtotal: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number; title?: string }>;
  onApplied: (discountAmount: number, code: string) => void;
  appliedCode?: string | null;
  appliedAmount?: number;
  onRemove?: () => void;
  onChangeClick?: () => void;
  forceShowInput?: boolean;
  customerEmail?: string | null;
  customerReferralCode?: string | null;
};

export function CouponInput({
  subtotal,
  items,
  onApplied,
  appliedCode,
  appliedAmount,
  onRemove,
  onChangeClick,
  forceShowInput = false,
  customerEmail,
  customerReferralCode,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const cartItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        title: i.title,
      }));
      const result = await validateStoreDiscount(trimmed, subtotal, cartItems, {
        customerEmail: customerEmail ?? undefined,
        customerReferralCode: customerReferralCode ?? undefined,
      });
      if (result.valid) {
        onApplied(result.discountAmount, trimmed.toUpperCase());
        setCode('');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  if (
    appliedCode &&
    appliedAmount != null &&
    appliedAmount > 0 &&
    !forceShowInput
  ) {
    const savingsPercent =
      subtotal > 0 ? Math.round((appliedAmount / subtotal) * 100) : 0;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(appliedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    };

    return (
      <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-3">
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Coupon {appliedCode} applied
          </p>
          <Badge
            variant="outline"
            className="mt-1 border-green-500/30 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
          >
            Save {savingsPercent}%
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
            <CopyIcon className="size-4" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {onChangeClick && (
            <Button variant="ghost" size="sm" onClick={onChangeClick}>
              Change
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 gap-2">
        <Input
          className="min-w-0 flex-1"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
          disabled={loading}
        />
        <Button
          variant="outline"
          className="shrink-0"
          onClick={handleValidate}
          disabled={loading || !code.trim()}
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
