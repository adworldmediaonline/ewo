'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import useGuestCartNavigation from '@/hooks/useGuestCartNavigation';
// import RenderCartProgress from './render-cart-progress';
import {
  add_cart_product,
  closeCartMini,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import {
  add_applied_coupon,
  clear_all_coupons,
  load_applied_coupons,
  remove_applied_coupon,
  set_coupon_error,
  set_coupon_loading,
} from '@/redux/features/coupon/couponSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import empty_cart_img from '@assets/img/product/cartmini/empty-cart.png';
// Removed CSS module import; Tailwind-only styling

export default function CartMiniSidebar() {
  const {
    cart_products,
    cartMiniOpen,
    firstTimeDiscount,
    totalShippingCost,
    shippingDiscount,
  } = useSelector(state => state.cart);

  // Enhanced coupon state
  const {
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
  } = useSelector(state => state.coupon);

  // Order state for address discount
  const {
    address_discount_eligible,
    address_discount_message,
    address_discount_percentage,
  } = useSelector(state => state.order);

  // Local state for coupon application
  const [couponApplyMsg, setCouponApplyMsg] = useState('');
  const [couponFormVisible, setCouponFormVisible] = useState(false);
  const couponRef = useRef(null);

  const { total, subtotal, firstTimeDiscountAmount } = useCartInfo();
  const { navigateToCart, navigateToCheckout } = useGuestCartNavigation();
  const dispatch = useDispatch();

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Clear success message when coupon is removed or when there's an error
  useEffect(() => {
    if (applied_coupons.length === 0) {
      setCouponApplyMsg('');
      dispatch(set_coupon_error(null));
    }
  }, [applied_coupons.length, dispatch]);

  // Calculate discount percentage to display for shipping
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

  // Calculate address discount amount
  const addressDiscountAmount = address_discount_eligible
    ? subtotal * (address_discount_percentage / 100)
    : 0;

  // Calculate final total with all discounts
  const calculateFinalTotal = () => {
    let finalTotal = Number(total) + Number(totalShippingCost);

    // Subtract coupon discounts
    if (Number(total_coupon_discount) > 0) {
      finalTotal -= Number(total_coupon_discount);
    }

    // Subtract address discount
    if (Number(addressDiscountAmount) > 0) {
      finalTotal -= Number(addressDiscountAmount);
    }

    return Math.max(0, finalTotal);
  };

  // Calculate cart totals for coupon validation
  const calculateTotals = () => {
    if (
      !cart_products ||
      !Array.isArray(cart_products) ||
      cart_products.length === 0
    ) {
      return { cartSubtotal: 0 };
    }

    try {
      const cartSubtotal = cart_products.reduce((total, item) => {
        const quantity = Number(item?.orderQuantity || 0);
        const price = Number(item?.finalPriceDiscount || 0);
        return total + quantity * price;
      }, 0);

      return {
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
      };
    } catch (error) {
      return { cartSubtotal: 0 };
    }
  };

  // Apply a new coupon
  const handleCouponSubmit = async e => {
    e.preventDefault();

    if (!couponRef.current?.value) {
      notifyError('Please enter a coupon code!');
      return;
    }

    const couponCode = couponRef.current.value.trim();

    if (!couponCode) {
      notifyError('Please enter a coupon code!');
      return;
    }

    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      const errorMsg = 'API configuration error. Please contact support.';

      notifyError(errorMsg);
      dispatch(set_coupon_error(errorMsg));
      return;
    }

    // Check if cart has products
    if (!cart_products || cart_products.length === 0) {
      notifyError('Your cart is empty. Add products before applying coupons.');
      return;
    }

    // Check if coupon is already applied
    const existingCoupon = applied_coupons.find(
      coupon =>
        coupon.couponCode.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (existingCoupon) {
      notifyError(`Coupon "${couponCode}" is already applied`);
      dispatch(set_coupon_error(`Coupon "${couponCode}" is already applied`));
      return;
    }

    dispatch(set_coupon_loading(true));
    dispatch(set_coupon_error(null));
    setCouponApplyMsg('');

    try {
      const { cartSubtotal } = calculateTotals();

      // Additional validation for cart subtotal
      if (cartSubtotal <= 0) {
        throw new Error(
          'Cart total must be greater than zero to apply coupons.'
        );
      }

      // If this is the first coupon, use single validation for backward compatibility
      if (applied_coupons.length === 0) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              couponCode: couponCode.trim(),
              cartItems: cart_products,
              cartTotal: cartSubtotal,
              cartSubtotal: cartSubtotal,
              shippingCost: 0,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to validate coupon');
        }

        if (result.success && result.data) {
          dispatch(add_applied_coupon(result.data));
          couponRef.current.value = '';
          setCouponApplyMsg(
            `Coupon "${result.data.couponCode}" applied successfully!`
          );
          notifySuccess(
            `Coupon "${result.data.couponCode}" applied successfully!`
          );
        } else {
          throw new Error(result.message || 'Coupon validation failed');
        }
      } else {
        // Use multiple coupon validation for additional coupons
        const newCouponCodes = [couponCode.trim()];
        const excludeAppliedCoupons = applied_coupons.map(c => c.couponCode);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              couponCodes: newCouponCodes,
              cartItems: cart_products,
              cartTotal: cartSubtotal,
              cartSubtotal: cartSubtotal,
              shippingCost: 0,
              excludeAppliedCoupons: excludeAppliedCoupons,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to validate coupons');
        }

        if (result.success && result.data.appliedCoupons.length > 0) {
          // Add each new coupon to the existing list
          result.data.appliedCoupons.forEach(couponData => {
            dispatch(add_applied_coupon(couponData));
          });

          couponRef.current.value = '';
          setCouponApplyMsg(
            `${result.data.appliedCoupons.length} coupon(s) applied successfully!`
          );
          notifySuccess(
            `${result.data.appliedCoupons.length} coupon(s) applied successfully!`
          );
        } else {
          const failureReason =
            result.data?.validationResults?.[0]?.message ||
            result.message ||
            'Coupon validation failed';
          throw new Error(failureReason);
        }
      }
    } catch (error) {
      // Provide more specific error messages based on error type
      let errorMessage;

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message.includes('API configuration')) {
        errorMessage = 'Configuration error. Please contact support.';
      } else if (error.message.includes('Cart total must be greater')) {
        errorMessage = 'Cart total must be greater than zero to apply coupons.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please try again.';
      } else {
        errorMessage =
          error.message || 'Failed to apply coupon. Please try again.';
      }

      setCouponApplyMsg(errorMessage);
      dispatch(set_coupon_error(errorMessage));
      notifyError(errorMessage);
    } finally {
      dispatch(set_coupon_loading(false));
    }
  };

  // handle remove product
  const handleRemovePrd = prd => {
    dispatch(remove_product(prd));
  };

  // handle close cart mini
  const handleCloseCartMini = () => {
    dispatch(closeCartMini());
  };

  // handle increment quantity
  const handleIncrement = prd => {
    dispatch(add_cart_product(prd));
  };

  // handle decrement quantity
  const handleDecrement = prd => {
    dispatch(quantityDecrement(prd));
  };

  // Handle remove individual coupon
  const handleRemoveCoupon = couponCode => {
    const removedCoupon = applied_coupons.find(
      c => c.couponCode === couponCode
    );
    dispatch(remove_applied_coupon(couponCode));

    if (removedCoupon) {
      notifySuccess(`Coupon "${couponCode}" removed successfully!`);
    }

    // Clear message if this was the last coupon
    if (applied_coupons.length === 1) {
      setCouponApplyMsg('');
    }
  };

  // Handle clear all coupons
  const handleClearAllCoupons = () => {
    dispatch(clear_all_coupons());
    setCouponApplyMsg('');
    notifySuccess('All coupons removed successfully!');
  };

  // Toggle coupon form
  const toggleCouponForm = () => {
    setCouponFormVisible(!couponFormVisible);
  };

  return (
    <>
      <div
        className=""
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="">
          <div className="">
            <div className="">
              <div className="">
                <h4 id="cart-title">
                  Shopping Cart
                  {cart_products.length > 0 && (
                    <span className="">{cart_products.length}</span>
                  )}
                </h4>
              </div>
              <button
                onClick={handleCloseCartMini}
                type="button"
                className=""
                aria-label="Close shopping cart"
              >
                ✕
              </button>
            </div>
            {/* First-time discount banner - Only show when NO coupons are applied */}
            {firstTimeDiscount.isApplied && applied_coupons.length === 0 && (
              <div className="">
                <div className="">
                  <span className="">🎉</span>
                  <span className="">First-time order discount applied!</span>
                  <span className="">-{firstTimeDiscount.percentage}%</span>
                </div>
              </div>
            )}

            {cart_products.length > 0 && (
              <div className="">
                {cart_products.map((item, i) => (
                  <div key={i} className="">
                    <div className="">
                      <Link href={`/product/${item.slug || item._id}`}>
                        <Image
                          src={item.img}
                          width={70}
                          height={70}
                          alt={`${item.title} product image`}
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>
                    </div>
                    <div className="">
                      <h5 className="">
                        <Link href={`/product/${item.slug || item._id}`}>
                          {item.title}
                        </Link>
                      </h5>
                      <div className="">
                        {/* Unit Price and Calculation Display */}
                        <div className="">
                          <span className="">
                            $
                            {item.discount > 0
                              ? (
                                  Number(item.finalPriceDiscount) -
                                  (Number(item.finalPriceDiscount) * Number(item.discount)) /
                                    100
                                ).toFixed(2)
                              : Number(item.finalPriceDiscount || 0).toFixed(2)}
                          </span>
                          <span className="">×</span>
                          <span className="">{item.orderQuantity}</span>
                          <span className="">=</span>
                          <span className="">
                            $
                            {item.discount > 0
                              ? (
                                  (Number(item.finalPriceDiscount) -
                                    (Number(item.finalPriceDiscount) *
                                      Number(item.discount)) /
                                      100) *
                                  item.orderQuantity
                                ).toFixed(2)
                              : (
                                  Number(item.finalPriceDiscount || 0) * item.orderQuantity
                                ).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="">
                          <button
                            onClick={() => handleDecrement(item)}
                            className=""
                            disabled={item.orderQuantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="">{item.orderQuantity}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className=""
                            aria-label="Increase quantity"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRemovePrd({ title: item.title, id: item._id })
                      }
                      className=""
                      aria-label={`Remove ${item.title} from cart`}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* if no item in cart */}
            {cart_products.length === 0 && (
              <div className="">
                <Image
                  src={empty_cart_img}
                  alt="Empty shopping cart illustration"
                  width={120}
                  height={120}
                />
                <p>Your cart is empty</p>
                <Link href="/shop" className="">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Essential Checkout Section - Always Visible */}
          <div className="">
            {/* Applied Coupons Section - Beautiful Banner */}
            {applied_coupons.length > 0 && (
              <div className="mb-3">
                <div className="space-y-2">
                  {applied_coupons.map((coupon, index) => {
                    // Calculate discount percentage if available
                    const cartSubtotal = cart_products.reduce((total, item) => {
                      return total + (Number(item.finalPriceDiscount || 0) * Number(item.orderQuantity || 1));
                    }, 0);
                    const discountPercent = coupon.discountType === 'percentage' && coupon.discountPercentage
                      ? coupon.discountPercentage
                      : coupon.discount && cartSubtotal > 0
                      ? ((coupon.discount / cartSubtotal) * 100).toFixed(1)
                      : null;

                    return (
                      <div
                        key={coupon.couponCode || index}
                        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-2.5 shadow-md"
                      >
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-full" />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wide">
                                {coupon.couponCode}
                              </p>
                              <p className="text-[9px] text-white/90 font-medium">
                                Applied
                              </p>
                            </div>
                          </div>
                          {discountPercent && (
                            <div className="bg-white rounded-full px-2 py-0.5">
                              <span className="text-xs font-extrabold text-emerald-600">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          )}
                          {!discountPercent && (
                            <div className="bg-white rounded-full px-2 py-0.5">
                              <span className="text-xs font-extrabold text-emerald-600">
                                -${coupon.discount?.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details Summary - Always visible */}
            <div className="">
              <div className="">
                <span>Subtotal:</span>
                <span>
                  $
                  {(
                    Number(firstTimeDiscount.isApplied ? subtotal : total) || 0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="">
                <span>Shipping:</span>
                <span>
                  ${(Number(totalShippingCost) || 0).toFixed(2)}
                  {discountPercentage > 0 && (
                    <span className="">{discountPercentage}% off</span>
                  )}
                </span>
              </div>

              {/* Multiple coupon discounts display */}
              {Number(total_coupon_discount) > 0 && (
                <div className=" ">
                  <span>
                    Coupon Discounts:
                    {applied_coupons.length > 1 && (
                      <span className="">{applied_coupons.length} coupons</span>
                    )}
                  </span>
                  <span>-${Number(total_coupon_discount).toFixed(2)}</span>
                </div>
              )}

              {/* Address discount */}
              {Number(addressDiscountAmount) > 0 && (
                <div className=" ">
                  <span>Address Discount:</span>
                  <span>-${Number(addressDiscountAmount).toFixed(2)}</span>
                </div>
              )}

              {/* First-time discount - Only show when NO coupons are applied */}
              {firstTimeDiscount.isApplied && applied_coupons.length === 0 && (
                <div className=" ">
                  <span>
                    First-time discount (-{firstTimeDiscount.percentage}%):
                  </span>
                  <span>
                    -${Number(firstTimeDiscountAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Essential Total - Always visible */}
            <div className="">
              <h4>Total:</h4>
              <span>${calculateFinalTotal().toFixed(2)}</span>
            </div>

            {/* Action Buttons - Single row with 50% width each */}
            <div className="">
              <button
                onClick={() => {
                  handleCloseCartMini();
                  navigateToCart();
                }}
                className=" "
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  handleCloseCartMini();
                  navigateToCheckout();
                }}
                className=""
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* overlay start */}
      <div onClick={handleCloseCartMini} className="" aria-hidden="true"></div>
      {/* overlay end */}
    </>
  );
}
