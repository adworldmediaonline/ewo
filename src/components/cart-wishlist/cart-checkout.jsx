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
  const couponInputRef = useRef(null);
  const [couponFormVisible, setCouponFormVisible] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const { totalShippingCost, shippingDiscount, cart_products } = useSelector(
    state => state.cart
  );
  const { applied_coupons = [], total_coupon_discount = 0 } = useSelector(
    state => state.coupon
  );
  const { address_discount } = useSelector(state => state.order);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

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
  const handleCouponSubmit = async e => {
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
          couponInputRef.current.value = '';
        } else {
          notifyError(data.message || 'Invalid coupon code');
        }
      } else {
        // Multiple coupons - use multiple validation endpoint
        const allCouponCodes = [couponCode]; // Only validate the new coupon
        const excludeAppliedCoupons = Array.isArray(applied_coupons)
          ? applied_coupons.map(c => c.couponCode)
          : [];

        // Check for duplicates locally first
        if (
          excludeAppliedCoupons.some(
            code => code.toLowerCase() === couponCode.toLowerCase()
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
          couponInputRef.current.value = '';
        } else {
          // Check validation results for specific error message
          const validationResult = data.data?.validationResults?.find(
            result =>
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
  const handleRemoveCoupon = couponId => {
    if (!Array.isArray(applied_coupons)) return;

    const coupon = applied_coupons.find(c => c._id === couponId);
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
    <div className="">
      <div className="">
        <h3 className="">Order Summary</h3>
      </div>

      <div className="">
        {/* Coupon Application Section */}
        <div className="">
          <div className="">
            <button
              onClick={() => setCouponFormVisible(!couponFormVisible)}
              className=""
              type="button"
            >
              {couponFormVisible ? '📝 Hide Coupon Form' : '🎟️ Apply Coupon'}
            </button>
          </div>

          {couponFormVisible && (
            <div className="">
              <form onSubmit={handleCouponSubmit} className="">
                <div className="">
                  <input
                    ref={couponInputRef}
                    type="text"
                    placeholder="Enter coupon code"
                    className=""
                    disabled={isApplyingCoupon}
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className=""
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
          <div className="">
            <div className="">
              <h4 className="">Applied Coupons ({applied_coupons.length})</h4>
              <button
                onClick={handleClearAllCoupons}
                className=""
                type="button"
              >
                Clear All
              </button>
            </div>
            <div className="">
              {applied_coupons.map((coupon, index) => (
                <div
                  key={coupon._id || coupon.couponCode || index}
                  className=""
                >
                  <div className="">
                    <span className="">{coupon.couponCode}</span>
                    <span className="">
                      -${coupon.discount ? coupon.discount.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCoupon(coupon._id)}
                    className=""
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
        <div className="">
          <span className="">Subtotal</span>
          <span className="">${totals.subtotal.toFixed(2)}</span>
        </div>

        <div className="">
          <h4 className="">Shipping</h4>
          <div className="">
            <div className="">
              <span className="">
                Calculated shipping:{' '}
                <span className="">${totals.shipping.toFixed(2)}</span>
                {discountPercentage > 0 && (
                  <span className="${styles['checkout-shipping-discount']} ms-2 badge bg-success">
                    {discountPercentage}% off
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Address Discount */}
        {totals.addressDiscount > 0 && (
          <div className="">
            <div className="">
              <span className="">📍 Address discount</span>
              <span className="">-${totals.addressDiscount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* First-time discount section */}
        {totals.firstTimeDiscount > 0 && (
          <div className="">
            <div className="">
              <span className="">
                🎉 First-time order discount (-{firstTimeDiscount.percentage}%)
              </span>
              <span className="">-${totals.firstTimeDiscount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Coupon Discounts */}
        {totals.couponDiscount > 0 && (
          <div className="">
            <div className="">
              <span className="">🎟️ Coupon discounts</span>
              <span className="">-${totals.couponDiscount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="">
          <span className="">Total</span>
          <span className="">${Math.max(0, totals.finalTotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="">
        <Link href="/checkout" className="">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
