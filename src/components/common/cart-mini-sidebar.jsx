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
import styles from './cart-mini-sidebar.module.css';

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
        const price = Number(item?.price || 0);
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
        className={`${styles.cartMiniArea} ${
          cartMiniOpen ? styles.cartMiniOpened : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className={styles.cartMiniWrapper}>
          <div className={styles.cartMiniTopWrapper}>
            <div className={styles.cartMiniTop}>
              <div className={styles.cartMiniTopTitle}>
                <h4 id="cart-title">
                  Shopping Cart
                  {cart_products.length > 0 && (
                    <span className={styles.itemCount}>
                      {cart_products.length}
                    </span>
                  )}
                </h4>
              </div>
              <button
                onClick={handleCloseCartMini}
                type="button"
                className={styles.cartMiniCloseBtn}
                aria-label="Close shopping cart"
              >
                ✕
              </button>
            </div>
            {/* First-time discount banner */}
            {firstTimeDiscount.isApplied && (
              <div className={styles.discountBanner}>
                <div className={styles.discountBannerContent}>
                  <span className={styles.discountIcon}>🎉</span>
                  <span className={styles.discountText}>
                    First-time order discount applied!
                  </span>
                  <span className={styles.discountAmount}>
                    -{firstTimeDiscount.percentage}%
                  </span>
                </div>
              </div>
            )}

            {cart_products.length > 0 && (
              <div className={styles.cartMiniWidget}>
                {cart_products.map((item, i) => (
                  <div key={i} className={styles.cartMiniWidgetItem}>
                    <div className={styles.cartMiniThumb}>
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
                    <div className={styles.cartMiniContent}>
                      <h5 className={styles.cartMiniTitle}>
                        <Link href={`/product/${item.slug || item._id}`}>
                          {item.title}
                        </Link>
                      </h5>
                      <div className={styles.cartMiniPriceWrapper}>
                        {/* Unit Price and Calculation Display */}
                        <div className={styles.priceCalculation}>
                          <span className={styles.unitPrice}>
                            $
                            {item.discount > 0
                              ? (
                                  Number(item.price) -
                                  (Number(item.price) * Number(item.discount)) /
                                    100
                                ).toFixed(2)
                              : Number(item.price).toFixed(2)}
                          </span>
                          <span className={styles.multiply}>×</span>
                          <span className={styles.quantity}>
                            {item.orderQuantity}
                          </span>
                          <span className={styles.equals}>=</span>
                          <span className={styles.totalPrice}>
                            $
                            {item.discount > 0
                              ? (
                                  (Number(item.price) -
                                    (Number(item.price) *
                                      Number(item.discount)) /
                                      100) *
                                  item.orderQuantity
                                ).toFixed(2)
                              : (
                                  Number(item.price) * item.orderQuantity
                                ).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className={styles.quantityControls}>
                          <button
                            onClick={() => handleDecrement(item)}
                            className={styles.quantityBtn}
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
                          <span className={styles.quantityValue}>
                            {item.orderQuantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className={styles.quantityBtn}
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
                      className={styles.cartMiniDel}
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
              <div className={styles.cartMiniEmpty}>
                <Image
                  src={empty_cart_img}
                  alt="Empty shopping cart illustration"
                  width={120}
                  height={120}
                />
                <p>Your cart is empty</p>
                <Link href="/shop" className={styles.tpBtn}>
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Essential Checkout Section - Always Visible */}
          <div className={styles.cartMiniCheckout}>
            {/* Apply Coupon Toggle */}
            {cart_products.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={toggleCouponForm}
                  className={styles.detailsToggle}
                  aria-expanded={couponFormVisible}
                  aria-controls="coupon-form"
                >
                  <span>
                    {couponFormVisible ? 'Hide Coupon Form' : 'Apply Coupon'}
                  </span>
                  <span
                    className={`${styles.toggleIcon} ${
                      couponFormVisible ? styles.toggleIconRotated : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Collapsible Coupon Form */}
                <div
                  id="coupon-form"
                  className={`${styles.detailsSection} ${
                    couponFormVisible
                      ? styles.detailsSectionVisible
                      : styles.detailsSectionHidden
                  }`}
                >
                  <div className={styles.detailsContent}>
                    {/* Apply Coupon Section */}
                    <div className={styles.couponSection}>
                      <div className={styles.couponForm}>
                        <input
                          ref={couponRef}
                          type="text"
                          placeholder="Enter coupon code"
                          className={styles.couponInput}
                          disabled={coupon_loading}
                        />
                        <button
                          type="button"
                          onClick={handleCouponSubmit}
                          className={styles.couponButton}
                          disabled={coupon_loading}
                        >
                          {coupon_loading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>

                      {/* Coupon messages */}
                      {couponApplyMsg && (
                        <div
                          className={`${styles.couponMessage} ${
                            coupon_error
                              ? styles.couponError
                              : styles.couponSuccess
                          }`}
                        >
                          {couponApplyMsg}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Applied Coupons Section - Always visible when coupons exist */}
            {applied_coupons.length > 0 && (
              <div className={styles.appliedCouponsSection}>
                <div className={styles.appliedCouponsHeader}>
                  <h4 className={styles.appliedCouponsTitle}>
                    Applied Coupons ({applied_coupons.length})
                  </h4>
                  {applied_coupons.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearAllCoupons}
                      className={styles.clearAllCouponsBtn}
                    >
                      Remove All
                    </button>
                  )}
                </div>

                <div className={styles.appliedCouponsList}>
                  {applied_coupons.map((coupon, index) => (
                    <div
                      key={coupon.couponCode || index}
                      className={styles.appliedCouponItem}
                    >
                      <div className={styles.appliedCouponDetails}>
                        <span className={styles.appliedCouponCode}>
                          {coupon.couponCode}
                        </span>
                        <span className={styles.appliedCouponDiscount}>
                          -${Number(coupon.discount || 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(coupon.couponCode)}
                        className={styles.removeCouponBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Details Summary - Always visible */}
            <div className={styles.cartMiniCheckoutSummary}>
              <div className={styles.cartMiniCheckoutLine}>
                <span>Subtotal:</span>
                <span>
                  $
                  {(
                    Number(firstTimeDiscount.isApplied ? subtotal : total) || 0
                  ).toFixed(2)}
                </span>
              </div>

              <div className={styles.cartMiniCheckoutLine}>
                <span>Shipping:</span>
                <span>
                  ${(Number(totalShippingCost) || 0).toFixed(2)}
                  {discountPercentage > 0 && (
                    <span className={styles.discountBadge}>
                      {discountPercentage}% off
                    </span>
                  )}
                </span>
              </div>

              {/* Multiple coupon discounts display */}
              {Number(total_coupon_discount) > 0 && (
                <div
                  className={`${styles.cartMiniCheckoutLine} ${styles.discountLine}`}
                >
                  <span>
                    Coupon Discounts:
                    {applied_coupons.length > 1 && (
                      <span className={styles.couponCountBadge}>
                        {applied_coupons.length} coupons
                      </span>
                    )}
                  </span>
                  <span>-${Number(total_coupon_discount).toFixed(2)}</span>
                </div>
              )}

              {/* Address discount */}
              {Number(addressDiscountAmount) > 0 && (
                <div
                  className={`${styles.cartMiniCheckoutLine} ${styles.discountLine}`}
                >
                  <span>Address Discount:</span>
                  <span>-${Number(addressDiscountAmount).toFixed(2)}</span>
                </div>
              )}

              {/* First-time discount */}
              {firstTimeDiscount.isApplied && (
                <div
                  className={`${styles.cartMiniCheckoutLine} ${styles.discountLine}`}
                >
                  <span>
                    First-time discount (-{firstTimeDiscount.percentage}%):
                  </span>
                  <span>
                    -${(Number(firstTimeDiscountAmount) || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Essential Total - Always visible */}
            <div className={styles.cartMiniCheckoutTitle}>
              <h4>Total:</h4>
              <span>${calculateFinalTotal().toFixed(2)}</span>
            </div>

            {/* Action Buttons - Single row with 50% width each */}
            <div className={styles.cartMiniCheckoutBtn}>
              <button
                onClick={() => {
                  handleCloseCartMini();
                  navigateToCart();
                }}
                className={`${styles.tpBtn} ${styles.tpBtnBorder}`}
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  handleCloseCartMini();
                  navigateToCheckout();
                }}
                className={styles.tpBtn}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* overlay start */}
      <div
        onClick={handleCloseCartMini}
        className={`${styles.bodyOverlay} ${
          cartMiniOpen ? styles.bodyOverlayOpened : ''
        }`}
        aria-hidden="true"
      ></div>
      {/* overlay end */}
    </>
  );
}
