'use client';
import Image from 'next/image';
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
// Removed CSS module import; Tailwind-only styling

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
    firstTimeDiscountAmount: 0,
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
    firstTimeDiscount,
  } = useSelector(state => state.cart);

  const { total, totalWithShipping, subtotal, firstTimeDiscountAmount } =
    useCartInfo();

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
      const firstTimeDiscountAmt = Number(firstTimeDiscountAmount) || 0;

      const manualTotal = cartTotal + shipping - firstTimeDiscountAmt;

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
        firstTimeDiscountAmount: firstTimeDiscountAmount,
        totalCouponDiscount: total_coupon_discount,
        appliedCoupons: applied_coupons,
        finalTotal: calculateFinalTotal(),
      });
    }
  }, [
    subtotal,
    totalShippingCost,
    firstTimeDiscountAmount,
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
  const displayFirstTimeDiscount = isProcessing
    ? savedOrderSummary.firstTimeDiscountAmount
    : firstTimeDiscountAmount;
  const displayTotalCouponDiscount = isProcessing
    ? savedOrderSummary.totalCouponDiscount
    : total_coupon_discount;
  const displayAppliedCoupons = isProcessing
    ? savedOrderSummary.appliedCoupons
    : applied_coupons;
  const displayFinalTotal = isProcessing
    ? savedOrderSummary.finalTotal
    : calculateFinalTotal();

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
          {cart_products.map(item => (
            <div
              key={item._id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-2"
            >
              {/* Left side: Image + Product Info */}
              <div className="flex items-center space-x-2 flex-1 min-w-0 max-w-[60%]">
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.img || '/placeholder-product.png'}
                    alt={item.title}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
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
              <div className="flex items-center space-x-3 flex-shrink-0">
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
          ))}
        </div>
      </ScrollArea>

      {/* Order Summary Section - moved from billing area */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Order Summary
        </h3>

        {/* Coupon Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <input
              ref={couponRef}
              type="text"
              placeholder="Add coupon code"
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              disabled={coupon_loading || isCheckoutSubmit || processingPayment}
            />
            <button
              type="button"
              onClick={handleCouponSubmit}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              disabled={coupon_loading || isCheckoutSubmit || processingPayment}
            >
              {coupon_loading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {/* Auto-fill helper messages */}
          {couponsLoading && (
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
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
            couponRef.current?.value &&
            displayAppliedCoupons.length === 0 &&
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
            <div className="text-sm text-destructive mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Coupon failed to apply. Please try again.
            </div>
          )}

          {/* Applied coupons display */}
          {displayAppliedCoupons.length > 0 && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground text-sm">
                  Applied Coupons ({displayAppliedCoupons.length})
                </h4>
                {displayAppliedCoupons.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearAllCoupons}
                    className="text-xs text-destructive hover:text-destructive/90 underline"
                    disabled={isCheckoutSubmit || processingPayment}
                  >
                    Remove All
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {displayAppliedCoupons.map((coupon, index) => (
                  <div
                    key={coupon.couponCode || index}
                    className="flex items-center justify-between p-2 bg-background rounded text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {coupon.couponCode}
                        </span>
                        <span className="font-medium text-foreground">
                          -${Number(coupon.discount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoupon(coupon.couponCode)}
                      className="text-destructive hover:text-destructive/90 ml-2"
                      disabled={isCheckoutSubmit || processingPayment}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              ${(Number(displaySubtotal) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">
              ${(Number(displayShipping) || 0).toFixed(2)}
              {discountPercentage > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                  {discountPercentage}% off
                </span>
              )}
            </span>
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

          {/* First-time discount */}
          {firstTimeDiscount.isApplied && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                First-time discount (-{firstTimeDiscount.percentage}%):
              </span>
              <span className="font-medium text-foreground">
                -${Number(displayFirstTimeDiscount || 0).toFixed(2)}
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
