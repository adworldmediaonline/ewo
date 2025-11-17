'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import useCartInfo from '@/hooks/use-cart-info';

import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import {
  load_applied_coupons,
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
  selectedOption?: {
    title: string;
    price: number;
  };
}

interface AppliedCoupon {
  _id?: string;
  couponCode: string;
  discount: number;
  discountType: string;
  discountPercentage?: number;
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

const isCloudinaryUrl = (url?: string) =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes('/upload/');

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

  // Detect mobile screen size for responsive alignment
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  function handleIncrement(item: CartItem): void {
    dispatch(
      add_cart_product({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount,
        sku: item.sku || item._id,
      } as any)
    );
  }

  function handleDecrement(item: CartItem): void {
    dispatch(
      quantityDecrement({
        ...item,
        finalPriceDiscount: item.finalPriceDiscount,
        sku: item.sku || item._id,
      } as any)
    );
  }

  function handleRemove(item: CartItem): void {
    dispatch(remove_product({ title: item.title, id: item._id }));
  }


  function renderLinePrice(item: CartItem): string {
    const base = Number(item.finalPriceDiscount || 0);
    const discount = Number(item.discount) || 0;
    const unit = discount > 0 ? base - (base * discount) / 100 : base;
    return (unit * Number(item.orderQuantity || 0)).toFixed(2);
  }

  const discountPercentage =
    Number(shippingDiscount) > 0
      ? String(Math.round(Number(shippingDiscount) * 100))
      : '0';

  const finalTotal = React.useMemo(() => {
    // When coupons are applied, use subtotal (ignore first-time discount)
    // When NO coupons are applied, use total (includes first-time discount)
    const baseTotal = applied_coupons.length > 0
      ? Number(subtotal || 0)
      : Number(total || 0);
    const shipping = Number(totalShippingCost || 0);
    const coupon = Number(total_coupon_discount || 0);
    return Math.max(0, baseTotal + shipping - coupon);
  }, [subtotal, total, totalShippingCost, total_coupon_discount, applied_coupons.length]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={0}
        sideOffset={4}
        collisionPadding={isMobile ? { right: 16, left: 16 } : 0}
        side="bottom"
        className={cn(
          "rounded-xl border border-border bg-popover p-0 shadow-xl z-2147483647",
          isMobile ? "w-[calc(100vw-2rem)] max-w-[26rem]" : "w-[26rem]"
        )}
      >
        {items.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="text-sm font-semibold">
                Shopping Cart ({items.length})
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Items */}
            <div className="max-h-80 overflow-auto px-4 py-3 grid gap-3">
              {items.map((item, idx) => {
                const imageUrl = item.img;
                const isCloudinaryImage = isCloudinaryUrl(imageUrl);

                return (
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
                      {imageUrl ? (
                        <CldImage
                          src={imageUrl}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          preserveTransformations={isCloudinaryImage}
                          deliveryType={isCloudinaryImage ? undefined : 'fetch'}
                          loading="lazy"
                          fetchPriority="low"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug || item._id}`}
                        className="line-clamp-2 text-sm font-medium"
                        onClick={() => setOpen(false)}
                      >
                        {item.title}
                      </Link>
                      {item.selectedOption && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.selectedOption.title} (+${Number(item.selectedOption.price).toFixed(2)})
                        </div>
                      )}
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
                );
              })}
            </div>

            {/* Coupon Section - Beautiful Applied Coupons Banner */}
            {applied_coupons.length > 0 && (
              <div className="px-4 py-2 border-t border-border/60">
                <div className="space-y-2">
                  {applied_coupons.map(
                    (coupon: AppliedCoupon, index: number) => {
                      // Calculate discount percentage if available
                      const discountPercent = coupon.discountType === 'percentage' && coupon.discountPercentage
                        ? coupon.discountPercentage
                        : coupon.discount && subtotal > 0
                          ? ((coupon.discount / subtotal) * 100).toFixed(1)
                          : null;

                      return (
                        <div
                          key={index}
                          className="relative overflow-hidden bg-linear-to-r from-emerald-500 to-green-500 rounded-lg p-3 shadow-md"
                        >
                          {/* Decorative corner */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full" />

                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wide">
                                  {coupon.couponCode}
                                </p>
                                <p className="text-[10px] text-white/90 font-medium">
                                  Applied Successfully
                                </p>
                              </div>
                            </div>
                            {discountPercent && (
                              <div className="bg-white rounded-full px-2.5 py-1">
                                <span className="text-xs font-extrabold text-emerald-600">
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                            {!discountPercent && (
                              <div className="bg-white rounded-full px-2.5 py-1">
                                <span className="text-xs font-extrabold text-emerald-600">
                                  -${coupon.discount?.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="px-4 py-3 space-y-2 text-sm">
              <div className="text-sm font-semibold mb-2">Order Summary</div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>
                  ${Number(subtotal || 0).toFixed(2)}
                </span>
              </div>
              {/* Only show first-time discount when NO coupons are applied */}
              {firstTimeDiscount?.isApplied && applied_coupons.length === 0 && (
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
                <span>
                  Shipping
                  {totalShippingCost === 0 && Number(subtotal) >= 500 && (
                    <span className="ml-1 text-xs text-emerald-600">
                      (Free on orders $500+)
                    </span>
                  )}
                  {totalShippingCost > 0 && Number(subtotal) < 500 && (
                    <span className="ml-1 text-xs text-blue-600">
                      (Free on $500+)
                    </span>
                  )}
                </span>
                {totalShippingCost === 0 && Number(subtotal) >= 500 ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : (
                  <span>
                    ${totalShippingCost.toFixed(2)}
                    {Number(discountPercentage) > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {discountPercentage}% off
                      </span>
                    )}
                  </span>
                )}
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
              {/* Total row - commented out, showing below instead */}
              {/* <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div> */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/60 mt-3">
                {/* View Cart button - commented out, replaced with total display */}
                {/* <Button
                  variant="outline"
                  onClick={handleViewCart}
                  className="w-full"
                >
                  View Cart
                </Button> */}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Total Payable</div>
                  <div className="text-lg font-bold">
                    ${finalTotal.toFixed(2)}
                  </div>
                </div>

                <Button asChild className="flex-1">
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                  >
                    Proceed to Buy
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
