'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import {
  add_applied_coupon,
  clear_all_coupons,
  load_applied_coupons,
  remove_applied_coupon,
} from '@/redux/features/coupon/couponSlice';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function CartCheckout() {
  const {
    total,
    totalWithShipping,
    subtotal,
    firstTimeDiscountAmount,
    firstTimeDiscount,
  } = useCartInfo();

  const dispatch = useDispatch();
  const couponInputRef = useRef<HTMLInputElement>(null);
  const [couponFormVisible, setCouponFormVisible] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const { totalShippingCost, shippingDiscount, cart_products } = useSelector(
    (state: any) => state.cart
  );
  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    (state: any) => state.coupon
  );
  const { address_discount } = useSelector((state: any) => state.order);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? Number((shippingDiscount * 100).toFixed(0)) : 0;

  // Calculate totals helper function
  const calculateTotals = () => {
    let currentSubtotal = subtotal;
    let currentShipping = totalShippingCost;
    let currentAddressDiscount = address_discount || 0;
    let currentFirstTimeDiscount = firstTimeDiscount.isApplied
      ? firstTimeDiscountAmount
      : 0;
    let currentCouponDiscount = total_coupon_discount || 0;

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
          <div className="mb-3">
            <button
              onClick={() => setCouponFormVisible(!couponFormVisible)}
              className="text-primary hover:text-primary/80 font-medium text-sm"
              type="button"
            >
              {couponFormVisible ? '📝 Hide Coupon Form' : '🎟️ Apply Coupon'}
            </button>
          </div>

          {couponFormVisible && (
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
            </div>
          )}
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
