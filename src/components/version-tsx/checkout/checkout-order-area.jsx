'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import { ScrollArea } from '@/components/ui/scroll-area';
import useCartInfo from '@/hooks/use-cart-info';
import {
  add_cart_product,
  get_cart_products,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import { load_applied_coupons } from '@/redux/features/coupon/couponSlice';
import { Minus, Plus } from '@/svg';
import { CardElement } from '@stripe/react-stripe-js';
import { CldImage } from 'next-cloudinary';
// Removed CSS module import; Tailwind-only styling

const isCloudinaryUrl = url =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes('/upload/');

export default function CheckoutOrderArea({ checkoutData }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Track if cart data has been loaded to prevent showing zeros
  const [cartDataLoaded, setCartDataLoaded] = useState(false);

  // Save discount values locally to preserve during checkout
  const [savedAddressDiscount, setSavedAddressDiscount] = useState(0);
  const [savedDiscountEligible, setSavedDiscountEligible] = useState(null);
  const [savedDiscountMessage, setSavedDiscountMessage] = useState('');

  // Save all order summary data during processing to preserve UI
  const [savedOrderSummary, setSavedOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    totalCouponDiscount: 0,
    appliedCoupons: [],
    finalTotal: 0,
  });

  // State to store the auto-filled coupon info for percentage display
  const [autoFilledCoupon, setAutoFilledCoupon] = useState(null);

  const {
    handleShippingCost,
    cartTotal = 0,
    isCheckoutSubmit,
    shippingCost,
    discountAmount,
    processingPayment,
    address_discount_eligible,
    address_discount_message,
    addressDiscountAmount,
    handleCouponSubmit,
    handleRemoveCoupon,
    handleClearAllCoupons,
    couponRef,
    couponApplyMsg,
    stripe,
    cardError,
  } = checkoutData;

  const {
    cart_products,
    totalShippingCost,
    shippingDiscount,
  } = useSelector(state => state.cart);

  const { total, totalWithShipping, subtotal } = useCartInfo();

  const { isCheckoutSubmitting } = useSelector(state => state.order);

  // Enhanced multiple coupon state
  const {
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
  } = useSelector(state => state.coupon);

  // Active coupons query for auto-fill
  const {
    data: activeCouponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useGetAllActiveCouponsQuery();

  // Load applied coupons on component mount and ensure cart data is loaded
  useEffect(() => {
    dispatch(load_applied_coupons());

    // Ensure cart data is loaded from localStorage
    dispatch(get_cart_products());

    // Quick check if data is immediately available
    const quickCheck = setTimeout(() => {
      const hasCartData =
        cart_products.length > 0 || subtotal > 0 || totalShippingCost > 0;
      if (hasCartData || (cart_products.length === 0 && subtotal === 0)) {
        setCartDataLoaded(true);
      }
    }, 100); // Very short delay to allow Redux update

    return () => clearTimeout(quickCheck);
  }, [dispatch]);

  // Monitor cart data loading state
  useEffect(() => {
    // Check if cart data has meaningful values or if there are products
    const hasCartData =
      cart_products.length > 0 || subtotal > 0 || totalShippingCost > 0;

    if (hasCartData || (cart_products.length === 0 && subtotal === 0)) {
      // Data is loaded (either with products or confirmed empty cart)
      setCartDataLoaded(true);
    }
  }, [cart_products, subtotal, totalShippingCost]);

  // Fallback: Set as loaded after a short delay to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!cartDataLoaded) {
        setCartDataLoaded(true);
      }
    }, 2000); // 2 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [cartDataLoaded]);

  // Smart auto-fill coupon code from various sources including backend
  useEffect(() => {
    const autoFillCouponCode = () => {
      // Don't proceed if coupons are still loading or ref is not available
      if (couponsLoading || !couponRef.current || couponRef.current.value) {
        return;
      }

      let couponCodeToFill = null;

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
        const availableCoupons = activeCouponsData.data.filter(coupon => {
          // Filter out already applied coupons
          const isAlreadyApplied = applied_coupons.some(
            appliedCoupon =>
              appliedCoupon.couponCode?.toLowerCase() ===
              coupon.couponCode?.toLowerCase()
          );
          return (
            !isAlreadyApplied && coupon.status === 'active' && coupon.couponCode
          );
        });

        if (availableCoupons.length > 0) {
          // Smart logic to select the best coupon:
          // 1. Priority by discount amount (highest first)
          // 2. Priority by minimum amount (lowest first, easier to qualify)
          // 3. Priority by discount percentage (highest first)

          const bestCoupon = availableCoupons.reduce((best, current) => {
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
          });

          couponCodeToFill = bestCoupon.couponCode;
          setAutoFilledCoupon(bestCoupon); // Store the coupon data for percentage display
        } else {
        }
      }

      // If we found a coupon code and the input field is available and empty
      if (couponCodeToFill && couponRef.current && !couponRef.current.value) {
        // Check if this coupon is not already applied
        const isAlreadyApplied = applied_coupons.some(
          coupon =>
            coupon.couponCode?.toLowerCase() === couponCodeToFill.toLowerCase()
        );

        if (!isAlreadyApplied) {
          couponRef.current.value = couponCodeToFill;

          // Clear the localStorage after auto-filling to prevent re-filling
          if (localStorage.getItem('pendingCouponCode')) {
            localStorage.removeItem('pendingCouponCode');
          }
        } else {
        }
      } else {
        if (!couponCodeToFill) {
        } else if (!couponRef.current) {
        } else if (couponRef.current.value) {
        }
      }
    };

    // Small delay to ensure the ref is available and coupons are loaded
    const timeoutId = setTimeout(autoFillCouponCode, 200);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    applied_coupons,
    couponRef,
    activeCouponsData,
    couponsLoading,
  ]);

  // Save discount values when they change and we're not in checkout process
  useEffect(() => {
    if (!isCheckoutSubmit && !isCheckoutSubmitting) {
      setSavedAddressDiscount(addressDiscountAmount);
      setSavedDiscountEligible(address_discount_eligible);
      setSavedDiscountMessage(address_discount_message);
    }
  }, [
    addressDiscountAmount,
    address_discount_eligible,
    address_discount_message,
    isCheckoutSubmit,
    isCheckoutSubmitting,
  ]);

  // Calculate final total with all discounts
  const calculateFinalTotal = () => {
    // Ensure we have a valid base total
    const baseTotal = Number(totalWithShipping);

    // If totalWithShipping is NaN or invalid, calculate it manually
    if (isNaN(baseTotal) || baseTotal <= 0) {
      const cartTotal =
        cart_products?.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.orderQuantity),
          0
        ) || 0;

      const shipping = Number(totalShippingCost) || 0;

      const manualTotal = cartTotal + shipping;

      let finalTotal = manualTotal;

      // Subtract multiple coupon discounts
      if (Number(total_coupon_discount) > 0) {
        finalTotal -= Number(total_coupon_discount);
      } else if (Number(discountAmount) > 0) {
        // Fall back to legacy discount amount
        finalTotal -= Number(discountAmount);
      }

      // Subtract address discount
      const addressDiscount = Number(displayAddressDiscount) || 0;
      if (addressDiscount > 0) {
        finalTotal -= addressDiscount;
      }

      return Math.max(0, finalTotal);
    }

    let finalTotal = baseTotal;

    // Subtract multiple coupon discounts
    if (Number(total_coupon_discount) > 0) {
      finalTotal -= Number(total_coupon_discount);
    } else if (Number(discountAmount) > 0) {
      // Fall back to legacy discount amount
      finalTotal -= Number(discountAmount);
    }

    // Subtract address discount
    const addressDiscount = Number(displayAddressDiscount) || 0;
    if (addressDiscount > 0) {
      finalTotal -= addressDiscount;
    }

    // Ensure total doesn't go below 0 and is a valid number
    const result = Math.max(0, finalTotal);
    return isNaN(result) ? 0 : result;
  };

  // Save complete order summary data when processing begins
  useEffect(() => {
    if (!isCheckoutSubmit && !isCheckoutSubmitting && !processingPayment) {
      // Save current order summary state
      setSavedOrderSummary({
        subtotal: subtotal,
        shipping: totalShippingCost,
        totalCouponDiscount: total_coupon_discount,
        appliedCoupons: applied_coupons,
        finalTotal: calculateFinalTotal(),
      });
    }
  }, [
    subtotal,
    totalShippingCost,
    total_coupon_discount,
    applied_coupons,
    isCheckoutSubmit,
    isCheckoutSubmitting,
    processingPayment,
  ]);

  // Use saved or current values depending on checkout state
  const displayAddressDiscount = isCheckoutSubmit
    ? savedAddressDiscount
    : addressDiscountAmount;
  const displayDiscountEligible = isCheckoutSubmit
    ? savedDiscountEligible
    : address_discount_eligible;
  const displayDiscountMessage = isCheckoutSubmit
    ? savedDiscountMessage
    : address_discount_message;

  // Use saved order summary data during processing
  const isProcessing =
    isCheckoutSubmit || isCheckoutSubmitting || processingPayment;
  const displaySubtotal = isProcessing ? savedOrderSummary.subtotal : subtotal;
  const displayShipping = isProcessing
    ? savedOrderSummary.shipping
    : totalShippingCost;
  const displayTotalCouponDiscount = isProcessing
    ? savedOrderSummary.totalCouponDiscount
    : total_coupon_discount;
  const displayAppliedCoupons = isProcessing
    ? savedOrderSummary.appliedCoupons
    : applied_coupons;
  const displayFinalTotal = isProcessing
    ? savedOrderSummary.finalTotal
    : calculateFinalTotal();

  // Calculate final total BEFORE shipping for free shipping eligibility check
  const displayFinalTotalBeforeShipping = isProcessing
    ? savedOrderSummary.subtotal - (savedOrderSummary.totalCouponDiscount || 0)
    : Number(subtotal) - Number(total_coupon_discount || 0);

  // Update shipping cost in checkout data when it changes
  useEffect(() => {
    handleShippingCost(totalShippingCost);
  }, [totalShippingCost, handleShippingCost]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

  // handle add product quantity
  const handleAddProduct = product => {
    dispatch(add_cart_product(product));
  };

  // handle decrement product quantity
  const handleDecrement = product => {
    dispatch(quantityDecrement(product));
  };

  // Show loading state while cart data is being loaded
  if (!cartDataLoaded) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
          Your Order
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">
            Loading order details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
        Your Order
      </h3>

      {/* Scrollable area for order items */}
      <ScrollArea className="h-[45px] md:h-[50px] pr-2">
        <div className="space-y-2 mb-4">
          {cart_products.map(item => {
            const imageUrl = item.img || '';
            const isCloudImage = isCloudinaryUrl(imageUrl);

            return (
              <div
                key={item._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-2"
              >
                {/* Left side: Image + Product Info */}
                <div className="flex items-center space-x-2 flex-1 min-w-0 max-w-[60%]">
                  <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 bg-muted">
                    {imageUrl ? (
                      <CldImage
                        src={imageUrl}
                        alt={item.title}
                        fill
                        sizes="32px"
                        className="object-cover"
                        preserveTransformations={isCloudImage}
                        deliveryType={isCloudImage ? undefined : 'fetch'}
                        loading="lazy"
                        fetchPriority="low"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="font-medium text-foreground text-xs leading-tight truncate">
                      {item.title.length > 25
                        ? `${item.title.substring(0, 25)}...`
                        : item.title}
                    </h4>
                    {item.selectedOption && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.selectedOption.title} (+$
                        {Number(item.selectedOption.price).toFixed(2)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Quantity Controls + Price */}
                <div className="flex items-center space-x-3 shrink-0">
                  {/* Compact quantity controls */}
                  <div className="flex items-center border border-border rounded">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className="w-5 h-5 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={
                        isCheckoutSubmit ||
                        processingPayment ||
                        item.orderQuantity <= 1
                      }
                    >
                      <Minus width={8} height={8} />
                    </button>
                    <span className="w-6 h-5 flex items-center justify-center text-xs font-medium">
                      {item.orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(item)}
                      className="w-5 h-5 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={isCheckoutSubmit || processingPayment}
                    >
                      <Plus width={8} height={8} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-foreground font-medium text-sm min-w-[5rem] w-[5rem] text-right whitespace-nowrap">
                    ${(item.price * item.orderQuantity).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Order Summary Section - moved from billing area */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Order Summary
        </h3>

        {/* Coupon Section */}
        {/* Applied Coupons - Beautiful Banner */}
        {displayAppliedCoupons.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Active Coupons
            </h4>
            <div className="space-y-3">
              {displayAppliedCoupons.map((coupon, index) => {
                // Calculate discount percentage if available
                const discountPercent = coupon.discountType === 'percentage' && coupon.discountPercentage
                  ? coupon.discountPercentage
                  : coupon.discount && displaySubtotal > 0
                    ? ((coupon.discount / displaySubtotal) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={coupon.couponCode || index}
                    className="relative overflow-hidden bg-linear-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl p-4 shadow-lg"
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
                            Save ${Number(coupon.discount || 0).toFixed(2)}
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

        {/* Pricing Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              ${(Number(displaySubtotal) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Shipping
              {displayShipping === 0 && displayFinalTotalBeforeShipping >= 500 && (
                <span className="ml-1 text-xs text-emerald-600">
                  (Free on orders $500+)
                </span>
              )}
              {displayShipping > 0 && displayFinalTotalBeforeShipping < 500 && (
                <span className="ml-1 text-xs text-blue-600">
                  (Free on $500+)
                </span>
              )}
            </span>
            {displayShipping === 0 && displayFinalTotalBeforeShipping >= 500 ? (
              <span className="font-bold text-emerald-600">FREE</span>
            ) : (
              <span className="font-medium text-foreground">
                ${(Number(displayShipping) || 0).toFixed(2)}
                {discountPercentage > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                    {discountPercentage}% off
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Multiple coupon discounts display */}
          {Number(displayTotalCouponDiscount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Coupon Discounts
                {displayAppliedCoupons.length > 1 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {displayAppliedCoupons.length} coupons
                  </span>
                )}
              </span>
              <span className="font-medium text-foreground">
                -${Number(displayTotalCouponDiscount).toFixed(2)}
              </span>
            </div>
          )}

          {/* Address discount */}
          {Number(displayAddressDiscount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Address Discount</span>
              <span className="font-medium text-foreground">
                -${Number(displayAddressDiscount).toFixed(2)}
              </span>
            </div>
          )}

        </div>

        {/* Total */}
        <div className="border-t border-border pt-3 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">
              ${displayFinalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6">
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-md bg-background">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="radio"
                  id="card-payment"
                  name="paymentMethod"
                  value="card"
                  defaultChecked
                  className="text-primary focus:ring-ring"
                />
                <label
                  htmlFor="card-payment"
                  className="font-medium text-foreground"
                >
                  Credit / Debit Card
                </label>
              </div>

              <div className="bg-background border border-border rounded-md p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#374151',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                    },
                  }}
                />
              </div>

              {cardError && (
                <div className="mt-2 text-sm text-destructive">{cardError}</div>
              )}
            </div>
          </div>
        </div>

        {/* Complete Purchase Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={!stripe || isCheckoutSubmit || processingPayment}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {processingPayment ? (
              <span className="flex items-center justify-center">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing Your Order...
              </span>
            ) : (
              `Complete Purchase - $${displayFinalTotal.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Address discount eligibility message */}
        {displayDiscountEligible === false && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              {displayDiscountMessage ||
                'Address discount not applicable for this order.'}
            </p>
          </div>
        )}

        {displayDiscountEligible === true && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              {displayDiscountMessage ||
                `Great! You're eligible for an address-based discount.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
