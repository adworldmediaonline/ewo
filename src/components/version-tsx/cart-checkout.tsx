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
  const { subtotal } = useCartInfo();

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
    const currentCouponDiscount = total_coupon_discount || 0;

    // Calculate final total BEFORE shipping for free shipping eligibility
    // Note: addressDiscount is applied to final total, not subtotal, so it doesn't affect free shipping eligibility
    const finalTotalBeforeShipping =
      currentSubtotal -
      currentCouponDiscount;

    return {
      subtotal: currentSubtotal,
      shipping: currentShipping,
      addressDiscount: currentAddressDiscount,
      couponDiscount: currentCouponDiscount,
      finalTotalBeforeShipping,
      finalTotal:
        currentSubtotal +
        currentShipping -
        currentAddressDiscount -
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
                totals.addressDiscount,
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
                totals.addressDiscount,
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
        {/* Coupon Application Section - Beautiful Banner */}
        {applied_coupons.length > 0 && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Coupon Discounts
            </h4>

            <div className="space-y-3">
              {applied_coupons.map((coupon: any, index: number) => {
                // Calculate discount percentage if available
                const discountPercent = coupon.discountType === 'percentage' && coupon.discountPercentage
                  ? coupon.discountPercentage
                  : coupon.discount && subtotal > 0
                  ? ((coupon.discount / subtotal) * 100).toFixed(1)
                  : null;

                return (
                  <div
                    key={index}
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl p-4 shadow-lg transform transition-all duration-300 hover:scale-105"
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-white uppercase tracking-wider">
                            {coupon.couponCode}
                          </p>
                          <p className="text-xs text-white/90 font-medium mt-0.5">
                            ✓ Applied Successfully
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {discountPercent && (
                          <div className="bg-white rounded-full px-3 py-1.5 shadow-md">
                            <span className="text-sm font-black text-emerald-600">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                          <span className="text-xs font-bold text-white">
                            Save ${coupon.discount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  Shipping
                  {totals.shipping === 0 && totals.finalTotalBeforeShipping >= 500 && (
                    <span className="ml-1 text-xs text-emerald-600">
                      (Free on orders $500+)
                    </span>
                  )}
                  {totals.shipping > 0 && totals.finalTotalBeforeShipping < 500 && (
                    <span className="ml-1 text-xs text-blue-600">
                      (Free on $500+)
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="text-green-600">
                      {' '}({discountPercentage}% off)
                    </span>
                  )}
                </span>
                {totals.shipping === 0 && totals.finalTotalBeforeShipping >= 500 ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : (
                  <span>${totals.shipping.toFixed(2)}</span>
                )}
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


          {/* Coupon Discounts */}
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">🎟️ Coupon discounts</span>
              <span className="text-success">
                -${totals.couponDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* <div className="flex justify-between pt-3 border-t font-bold text-lg">
            <span>Total</span>
            <span>${Math.max(0, totals.finalTotal).toFixed(2)}</span>
          </div> */}
          {/* total */}
          <div className="border-t border-border pt-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                ${Math.max(0, totals.finalTotal).toFixed(2)}
              </span>
            </div>
          </div>
          {/* total code end here */}


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
