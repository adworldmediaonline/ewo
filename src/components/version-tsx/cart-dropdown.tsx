'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useCartInfo from '@/hooks/use-cart-info';

import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import {
  add_applied_coupon,
  clear_all_coupons,
  load_applied_coupons,
  remove_applied_coupon,
} from '@/redux/features/coupon/couponSlice';
import { X as XIcon } from 'lucide-react';

interface CartItem {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  price: number | string;
  discount?: number | string;
  orderQuantity: number;
  shipping?: {
    price: number;
  };
  finalPriceDiscount?: number | string;
  sku?: string;
}

interface AppliedCoupon {
  _id?: string;
  couponCode: string;
  discount: number;
  discountType: string;
  title?: string;
}

interface CouponData {
  couponId: string;
  couponCode: string;
  discount: number;
  discountType: string;
  title?: string;
  discountAmount?: number;
  discountPercentage?: number;
  minimumAmount?: number;
  status?: string;
}

export default function CartDropdown({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subtotal, total, firstTimeDiscountAmount } = useCartInfo();

  // Add state to control dropdown
  const [open, setOpen] = React.useState(false);

  // Coupon functionality state
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] =
    React.useState<boolean>(false);
  const [autoFilledCoupon, setAutoFilledCoupon] =
    React.useState<CouponData | null>(null);

  const {
    cart_products,
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
  } = useSelector((s: any) => s.cart);
  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    (s: any) => s.coupon ?? {}
  );

  // Fetch all active coupons from backend for smart auto-fill
  const {
    data: activeCouponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useGetAllActiveCouponsQuery({});

  const items: CartItem[] = Array.isArray(cart_products) ? cart_products : [];

  // Load applied coupons on component mount
  React.useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Smart auto-fill coupon code from various sources including backend
  React.useEffect(() => {
    const autoFillCouponCode = () => {
      // Don't proceed if coupons are still loading or input already has value
      if (couponsLoading || couponCode) {
        return;
      }

      let couponCodeToFill: string | null = null;

      // Priority order for coupon sources:
      // 1. URL parameter 'coupon' or 'couponCode' or 'code' (highest priority)
      // 2. localStorage 'pendingCouponCode'
      // 3. Smart selection from backend active coupons (best coupon logic)

      // Check URL parameters first (highest priority)
      const urlCoupon =
        searchParams.get('coupon') ||
        searchParams.get('couponCode') ||
        searchParams.get('code');

      if (urlCoupon) {
        couponCodeToFill = urlCoupon.trim();
      }

      // Check localStorage for pending coupon
      if (!couponCodeToFill) {
        const pendingCoupon = localStorage.getItem('pendingCouponCode');
        if (pendingCoupon) {
          try {
            const parsed = JSON.parse(pendingCoupon);
            couponCodeToFill =
              typeof parsed === 'string' ? parsed : parsed.code;
          } catch {
            couponCodeToFill = pendingCoupon;
          }
        }
      }

      // Smart selection from backend active coupons (if no URL/localStorage coupon)
      if (
        !couponCodeToFill &&
        activeCouponsData?.success &&
        activeCouponsData?.data?.length > 0
      ) {
        const availableCoupons = activeCouponsData.data.filter(
          (coupon: CouponData) => {
            // Filter out already applied coupons
            const isAlreadyApplied = applied_coupons.some(
              (appliedCoupon: AppliedCoupon) =>
                appliedCoupon.couponCode?.toLowerCase() ===
                coupon.couponCode?.toLowerCase()
            );
            return (
              !isAlreadyApplied &&
              coupon.status === 'active' &&
              coupon.couponCode
            );
          }
        );

        if (availableCoupons.length > 0) {
          // Smart logic to select the best coupon:
          // 1. Priority by discount amount (highest first)
          // 2. Priority by minimum amount (lowest first, easier to qualify)
          // 3. Priority by discount percentage (highest first)

          const bestCoupon = availableCoupons.reduce(
            (best: CouponData, current: CouponData) => {
              // Priority 1: Higher discount amount
              const bestDiscount = best.discountAmount || 0;
              const currentDiscount = current.discountAmount || 0;

              if (currentDiscount > bestDiscount) return current;
              if (currentDiscount < bestDiscount) return best;

              // Priority 2: Lower minimum amount (easier to qualify)
              const bestMinimum = best.minimumAmount || 0;
              const currentMinimum = current.minimumAmount || 0;

              if (currentMinimum < bestMinimum) return current;
              if (currentMinimum > bestMinimum) return best;

              // Priority 3: Higher discount percentage
              const bestPercentage = best.discountPercentage || 0;
              const currentPercentage = current.discountPercentage || 0;

              return currentPercentage > bestPercentage ? current : best;
            }
          );

          couponCodeToFill = bestCoupon.couponCode;
          setAutoFilledCoupon(bestCoupon);
        }
      }

      // If we found a coupon code and it's not already applied
      if (couponCodeToFill) {
        const isAlreadyApplied = applied_coupons.some(
          (coupon: AppliedCoupon) =>
            coupon.couponCode?.toLowerCase() === couponCodeToFill?.toLowerCase()
        );

        if (!isAlreadyApplied) {
          setCouponCode(couponCodeToFill);

          // Clear the localStorage after auto-filling to prevent re-filling
          if (localStorage.getItem('pendingCouponCode')) {
            localStorage.removeItem('pendingCouponCode');
          }
        }
      }
    };

    // Small delay to ensure the component is ready
    const timeoutId = setTimeout(autoFillCouponCode, 200);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    applied_coupons,
    activeCouponsData,
    couponsLoading,
    couponCode,
  ]);

  // Calculate totals for coupon validation
  const calculateTotals = () => {
    const subtotal = Number(total || 0);
    const shipping = Number(totalShippingCost || 0);
    const firstTimeDiscount = Number(firstTimeDiscountAmount || 0);
    const addressDiscount = 0; // Not available in dropdown context
    const currentCouponDiscount = Number(total_coupon_discount || 0);

    return {
      subtotal,
      shipping,
      firstTimeDiscount,
      addressDiscount,
      currentCouponDiscount,
    };
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || isApplyingCoupon) return;

    setIsApplyingCoupon(true);

    try {
      const totals = calculateTotals();

      if (applied_coupons.length === 0) {
        // First coupon - use validation endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponCode: couponCode.trim(),
              cartItems: cart_products,
              cartTotal:
                totals.subtotal +
                totals.shipping -
                totals.addressDiscount -
                totals.firstTimeDiscount,
              cartSubtotal: totals.subtotal,
              shippingCost: totals.shipping,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          dispatch(
            add_applied_coupon({
              _id: data.data.couponId,
              couponCode: data.data.couponCode,
              discount: data.data.discount,
              discountType: data.data.discountType,
              title: data.data.title || data.data.couponCode,
            } as AppliedCoupon)
          );
          setCouponCode('');
          setAutoFilledCoupon(null);
        } else {
        }
      } else {
        // Multiple coupons - use multiple validation endpoint
        const allCouponCodes = [
          ...applied_coupons.map((c: any) => c.couponCode),
          couponCode.trim(),
        ];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponCodes: allCouponCodes,
              cartItems: cart_products,
              cartTotal:
                totals.subtotal +
                totals.shipping -
                totals.addressDiscount -
                totals.firstTimeDiscount,
              cartSubtotal: totals.subtotal,
              shippingCost: totals.shipping,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          // Clear existing coupons and add all validated ones
          dispatch(clear_all_coupons());

          data.data.forEach((coupon: CouponData) => {
            dispatch(
              add_applied_coupon({
                _id: coupon.couponId,
                couponCode: coupon.couponCode,
                discount: coupon.discount,
                discountType: coupon.discountType,
                title: coupon.title || coupon.couponCode,
              } as AppliedCoupon)
            );
          });

          setCouponCode('');
          setAutoFilledCoupon(null);
        } else {
        }
      }
    } catch (error) {
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = (couponCodeToRemove: string) => {
    dispatch(remove_applied_coupon(couponCodeToRemove));
  };

  function handleIncrement(item: CartItem): void {
    dispatch(
      add_cart_product({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount || item.price,
        sku: item.sku || item._id,
      } as any)
    );
  }
  function handleDecrement(item: CartItem): void {
    dispatch(
      quantityDecrement({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount || item.price,
        sku: item.sku || item._id,
      } as any)
    );
  }
  function handleRemove(item: CartItem): void {
    dispatch(remove_product({ title: item.title, id: item._id }));
  }

  // Navigation functions
  const navigateToCart = () => {
    router.push('/cart');
  };

  const navigateToCheckout = () => {
    router.push('/checkout');
  };

  // Enhanced navigation functions that close dropdown
  const handleViewAll = () => {
    setOpen(false);
    navigateToCart();
  };

  const handleViewCart = () => {
    setOpen(false);
    navigateToCart();
  };

  const handleCheckout = () => {
    setOpen(false);
    navigateToCheckout();
  };

  function renderLinePrice(item: CartItem): string {
    const base = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const unit = discount > 0 ? base - (base * discount) / 100 : base;
    return (unit * Number(item.orderQuantity || 0)).toFixed(2);
  }

  const discountPercentage =
    Number(shippingDiscount) > 0
      ? String(Math.round(Number(shippingDiscount) * 100))
      : '0';

  const finalTotal = React.useMemo(() => {
    const baseTotal = Number(total || 0);
    const shipping = Number(totalShippingCost || 0);
    const coupon = Number(total_coupon_discount || 0);
    return Math.max(0, baseTotal + shipping - coupon);
  }, [total, totalShippingCost, total_coupon_discount]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,26rem)] rounded-xl border border-border bg-popover p-0 shadow-xl z-[2147483647]"
      >
        {items.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm font-semibold">
                My Cart ({items.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleViewAll}
              >
                View all
              </Button>
            </div>

            {/* Items */}
            <div className="max-h-80 overflow-auto p-3 pr-1 grid gap-3">
              {items.map((item, idx) => (
                <div
                  key={`${item._id}-${idx}`}
                  className="grid grid-cols-[56px_1fr_auto] items-start gap-3 rounded-lg border border-border/60 bg-background p-2"
                >
                  <Link
                    href={`/product/${item.slug || item._id}`}
                    className="relative h-14 w-14 overflow-hidden rounded-md bg-muted"
                    aria-label={item.title}
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug || item._id}`}
                      className="line-clamp-2 text-sm font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {Number(item.discount || 0) > 0 && (
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Disc {Number(item.discount)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                        onClick={() => handleDecrement(item)}
                        disabled={item.orderQuantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">
                        {item.orderQuantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent"
                        onClick={() => handleIncrement(item)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item)}
                    >
                      <XIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <div className="text-sm font-semibold">
                      ${renderLinePrice(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="px-3 py-2 border-t border-border/60">
              {/* Auto-filled coupon message */}
              {autoFilledCoupon && (
                <div className="mb-2 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-xs">🎯</span>
                    <span className="text-xs text-emerald-700 font-medium">
                      Best Coupon Found! Click Apply to save{' '}
                      {autoFilledCoupon.discountPercentage
                        ? `${autoFilledCoupon.discountPercentage}%`
                        : autoFilledCoupon.discountAmount
                        ? `$${autoFilledCoupon.discountAmount}`
                        : 'money'}{' '}
                      on your order
                    </span>
                  </div>
                </div>
              )}

              {/* Applied Coupons */}
              {applied_coupons.length > 0 && (
                <div className="mb-2 space-y-1">
                  {applied_coupons.map(
                    (coupon: AppliedCoupon, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-md"
                      >
                        <span className="text-xs text-emerald-700 font-medium">
                          {coupon.couponCode}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-600">
                            -${coupon.discount || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveCoupon(coupon.couponCode)
                            }
                            className="text-emerald-500 hover:text-emerald-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Coupon Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyPress={e => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  size="sm"
                  className="px-3 py-1 text-xs h-auto"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            </div>

            {/* Summary (no separators) */}
            <div className="px-3 py-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>
                  $
                  {Number(
                    firstTimeDiscount?.isApplied ? subtotal : total || 0
                  ).toFixed(2)}
                </span>
              </div>
              {firstTimeDiscount?.isApplied && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>
                    First-time discount (-{firstTimeDiscount?.percentage}%)
                  </span>
                  <span>
                    -${Number(firstTimeDiscountAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>
                  ${totalShippingCost.toFixed(2)}
                  {Number(discountPercentage) > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {discountPercentage}% off
                    </span>
                  )}
                </span>
              </div>
              {Number(total_coupon_discount) > 0 && (
                <div className="flex items-center justify-between">
                  <span>
                    Coupon Discounts
                    {Array.isArray(applied_coupons) &&
                      applied_coupons.length > 1 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({applied_coupons.length} coupons)
                        </span>
                      )}
                  </span>
                  <span>- ${Number(total_coupon_discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleViewCart}
                  className="w-full"
                >
                  View Cart
                </Button>
                <Button onClick={handleCheckout} className="w-full">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
