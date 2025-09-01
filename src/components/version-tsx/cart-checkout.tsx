'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import {
  add_applied_coupon,
  clear_all_coupons,
  load_applied_coupons,
  remove_applied_coupon,
} from '@/redux/features/coupon/couponSlice';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function CartCheckout() {
  const { subtotal, firstTimeDiscountAmount, firstTimeDiscount } =
    useCartInfo();

  const dispatch = useDispatch();
  const couponInputRef = useRef<HTMLInputElement>(null);

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Get URL search parameters for auto-fill functionality
  const searchParams = useSearchParams();

  // Fetch all active coupons from backend for smart auto-fill
  const {
    data: activeCouponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useGetAllActiveCouponsQuery({});

  const { totalShippingCost, shippingDiscount, cart_products } = useSelector(
    (state: any) => state.cart
  );
  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    (state: any) => state.coupon
  );
  const { address_discount } = useSelector((state: any) => state.order);

  // State to store the auto-filled coupon info for percentage display
  const [autoFilledCoupon, setAutoFilledCoupon] = useState<any>(null);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Smart auto-fill coupon code from various sources including backend
  useEffect(() => {
    const autoFillCouponCode = () => {
      // Don't proceed if coupons are still loading
      if (couponsLoading) {
        return;
      }

      // If input already has value, don't proceed
      if (couponInputRef.current?.value) {
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
        } else {
        }
      }

      // Smart selection from backend active coupons (if no URL/localStorage coupon)
      if (
        !couponCodeToFill &&
        activeCouponsData?.success &&
        activeCouponsData?.data?.length > 0
      ) {
        const availableCoupons = activeCouponsData.data.filter(
          (coupon: any) => {
            // Filter out already applied coupons
            const isAlreadyApplied = applied_coupons.some(
              (appliedCoupon: any) =>
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
            (best: any, current: any) => {
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
          setAutoFilledCoupon(bestCoupon); // Store the coupon data for percentage display
        } else {
        }
      }

      // Apply the selected coupon code
      if (couponCodeToFill) {
        // Double-check if this coupon is not already applied
        const isAlreadyApplied = applied_coupons.some(
          (coupon: any) =>
            coupon.couponCode?.toLowerCase() === couponCodeToFill?.toLowerCase()
        );

        if (!isAlreadyApplied) {
          // Form is always visible now, fill directly
          if (couponInputRef.current && !couponInputRef.current.value) {
            couponInputRef.current.value = couponCodeToFill;

            // Clear the localStorage after auto-filling to prevent re-filling
            if (localStorage.getItem('pendingCouponCode')) {
              localStorage.removeItem('pendingCouponCode');
            }
          }
        } else {
        }
      } else {
      }
    };

    // Small delay to ensure the ref is available and coupons are loaded
    const timeoutId = setTimeout(autoFillCouponCode, 200);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    applied_coupons,
    couponInputRef,
    activeCouponsData,
    couponsLoading,
  ]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? Number((shippingDiscount * 100).toFixed(0)) : 0;

  // Calculate totals helper function
  const calculateTotals = () => {
    const currentSubtotal = subtotal;
    const currentShipping = totalShippingCost;
    const currentAddressDiscount = address_discount || 0;
    const currentFirstTimeDiscount = firstTimeDiscount.isApplied
      ? firstTimeDiscountAmount
      : 0;
    const currentCouponDiscount = total_coupon_discount || 0;

    return {
      subtotal: currentSubtotal,
      shipping: currentShipping,
      addressDiscount: currentAddressDiscount,
      firstTimeDiscount: currentFirstTimeDiscount,
      couponDiscount: currentCouponDiscount,
      finalTotal:
        currentSubtotal +
        currentShipping -
        currentAddressDiscount -
        currentFirstTimeDiscount -
        currentCouponDiscount,
    };
  };

  // Handle coupon submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponCode = couponInputRef.current?.value?.trim();

    if (!couponCode) {
      notifyError('Please enter a coupon code');
      return;
    }

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
              couponCode,
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
            })
          );
          notifySuccess(
            `Coupon "${couponCode}" applied successfully! You saved $${data.data.discount.toFixed(
              2
            )}`
          );
          if (couponInputRef.current) {
            couponInputRef.current.value = '';
          }
        } else {
          notifyError(data.message || 'Invalid coupon code');
        }
      } else {
        // Multiple coupons - use multiple validation endpoint
        const allCouponCodes = [couponCode]; // Only validate the new coupon
        const excludeAppliedCoupons = Array.isArray(applied_coupons)
          ? applied_coupons.map((c: any) => c.couponCode)
          : [];

        // Check for duplicates locally first
        if (
          excludeAppliedCoupons.some(
            (code: string) => code.toLowerCase() === couponCode.toLowerCase()
          )
        ) {
          notifyError('This coupon is already applied');
          return;
        }

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
              excludeAppliedCoupons: excludeAppliedCoupons,
            }),
          }
        );

        const data = await response.json();

        if (
          response.ok &&
          data.success &&
          data.data.appliedCoupons.length > 0
        ) {
          // Add the new coupon
          const newCoupon = data.data.appliedCoupons[0];
          dispatch(
            add_applied_coupon({
              _id: newCoupon.couponId,
              couponCode: newCoupon.couponCode,
              discount: newCoupon.discount,
              discountType: newCoupon.discountType,
              title: newCoupon.title || newCoupon.couponCode,
            })
          );
          notifySuccess(
            `Coupon "${couponCode}" applied successfully! You saved $${newCoupon.discount.toFixed(
              2
            )}`
          );
          if (couponInputRef.current) {
            couponInputRef.current.value = '';
          }
        } else {
          // Check validation results for specific error message
          const validationResult = data.data?.validationResults?.find(
            (result: any) =>
              result.couponCode.toLowerCase() === couponCode.toLowerCase()
          );
          const errorMessage =
            validationResult?.message || data.message || 'Invalid coupon code';
          notifyError(errorMessage);
        }
      }
    } catch (error) {
      notifyError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = (couponId: string) => {
    if (!Array.isArray(applied_coupons)) return;

    const coupon = applied_coupons.find((c: any) => c._id === couponId);
    if (coupon) {
      dispatch(remove_applied_coupon(coupon.couponCode));
      notifySuccess(`Coupon "${coupon.couponCode}" removed successfully`);
    }
  };

  // Handle clear all coupons
  const handleClearAllCoupons = () => {
    dispatch(clear_all_coupons());
    notifySuccess('All coupons removed successfully');
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
      <div className="border-b pb-4 mb-4">
        <h3 className="text-xl font-bold">Order Summary</h3>
      </div>

      <div className="space-y-6">
        {/* Coupon Application Section */}
        <div className="border-b pb-4">
          <h4 className="font-medium text-foreground mb-3">🎟️ Apply Coupon</h4>

          <div className="mt-3">
            <form onSubmit={handleCouponSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  ref={couponInputRef}
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isApplyingCoupon}
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </form>

            {/* Auto-fill helper messages for cart */}
            {couponsLoading && (
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-primary animate-spin"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1h-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Looking for the best coupon for you...
              </div>
            )}

            {!couponsLoading &&
              couponInputRef.current?.value &&
              applied_coupons.length === 0 &&
              autoFilledCoupon &&
              autoFilledCoupon.discountPercentage && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Best Coupon Found!
                        </p>
                        <p className="text-xs text-green-600">
                          Click Apply to save{' '}
                          {autoFilledCoupon.discountPercentage}% on your order
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                        {autoFilledCoupon.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {couponsError && (
              <div className="text-sm text-destructive mt-2 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Unable to load coupons. Please enter manually.
              </div>
            )}
          </div>
        </div>

        {/* Applied Coupons Section */}
        {Array.isArray(applied_coupons) && applied_coupons.length > 0 && (
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">
                Applied Coupons ({applied_coupons.length})
              </h4>
              <button
                onClick={handleClearAllCoupons}
                className="text-destructive hover:text-destructive/80 text-sm"
                type="button"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {applied_coupons.map((coupon: any, index: number) => (
                <div
                  key={coupon._id || coupon.couponCode || index}
                  className="flex justify-between items-center bg-muted rounded-md p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {coupon.couponCode}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      -${coupon.discount ? coupon.discount.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCoupon(coupon._id)}
                    className="text-muted-foreground hover:text-destructive"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary Details */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>

          <div className="border-b pb-3">
            {/* <h4 className="text-muted-foreground mb-2">Shipping</h4> */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Shipping:{' '}
                  {discountPercentage > 0 && (
                    <span className="text-green-600">
                      ({discountPercentage}% off)
                    </span>
                  )}
                </span>
                <span>${totals.shipping.toFixed(2)}</span>
              </div>
              {/* {discountPercentage > 0 && (
                <div className="text-xs text-green-600">
                  {discountPercentage}% off
                </div>
              )} */}
            </div>
          </div>

          {/* Address Discount */}
          {totals.addressDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">📍 Address discount</span>
              <span className="text-success">
                -${totals.addressDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* First-time discount section */}
          {totals.firstTimeDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-green-600">
                First Time order discount (-{firstTimeDiscount.percentage}%)
              </span>
              <span className="text-success">
                -${totals.firstTimeDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Coupon Discounts */}
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">🎟️ Coupon discounts</span>
              <span className="text-success">
                -${totals.couponDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t font-bold text-lg">
            <span>Total</span>
            <span>${Math.max(0, totals.finalTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background w-full py-2.5"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
