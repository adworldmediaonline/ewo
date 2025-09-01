'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Check, Clock, Copy, Package, Tag } from 'lucide-react';
import { useState } from 'react';
import { useTimer } from 'react-timer-hook';

export interface Coupon {
  _id: string;
  couponCode: string;
  discountType: 'percentage' | 'amount';
  discountPercentage?: number;
  discountAmount?: number;
  endTime: string;
  applicableProducts: any[];
  applicableType?: 'all' | 'product' | 'category' | 'brand';
  description?: string;
  minimumOrderAmount?: number;
}

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const expiryTimestamp = new Date(coupon.endTime);

  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn('Coupon expired'),
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy coupon code:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired =
    !isRunning || (days === 0 && hours === 0 && minutes === 0 && seconds === 0);

  const getDiscountText = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountPercentage}% OFF`;
    }
    return `$${coupon.discountAmount} OFF`;
  };

  const getProgressWidth = () => {
    const totalHours = days * 24 + hours;
    return Math.max(15, Math.min(100, totalHours * 3));
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isExpired
          ? 'bg-muted/50 border-muted opacity-75'
          : 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Side - Discount Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge
                variant={isExpired ? 'secondary' : 'destructive'}
                className="h-12 px-4 text-lg font-bold"
              >
                <Tag className="h-5 w-5 mr-2" />
                {getDiscountText()}
              </Badge>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{isExpired ? 'Expired' : 'Ends in:'}</span>
                </div>

                {!isExpired && (
                  <div className="flex items-center gap-3">
                    {days > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {days}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          days
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">hrs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">min</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">sec</div>
                    </div>
                  </div>
                )}

                {isExpired && (
                  <div className="text-destructive font-medium">⏰ Expired</div>
                )}
              </div>
            </div>

            {coupon.description && (
              <p className="text-sm text-muted-foreground max-w-md">
                {coupon.description}
              </p>
            )}
          </div>

          {/* Right Side - Coupon Code & Actions */}
          <div className="space-y-4">
            {/* Coupon Code */}
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Code:</span>
                <div className="mt-2 flex items-center gap-2 justify-center">
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-lg font-mono font-bold border-2 border-dashed border-primary/50"
                  >
                    {coupon.couponCode}
                  </Badge>
                  <Button
                    size="icon"
                    variant="outline"
                    className={`h-10 w-10 ${
                      copySuccess
                        ? 'bg-green-500 text-white border-green-500'
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    onClick={handleCopyCode}
                    title={copySuccess ? 'Copied!' : 'Copy code'}
                    disabled={isExpired}
                  >
                    {copySuccess ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {copySuccess && (
                  <span className="text-sm text-green-600 font-medium">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">Valid Until</div>
                <div className="text-sm font-medium">
                  {formatDate(coupon.endTime)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Package className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">Products</div>
                <div className="text-sm font-medium">
                  {coupon.applicableType === 'all'
                    ? 'All Products'
                    : `${coupon.applicableProducts.length} items`}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {!isExpired && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Time remaining
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressWidth()}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
