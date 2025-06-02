'use client';
import { useState, useEffect } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useSelector, useDispatch } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import ErrorMsg from '../common/error-msg';
import { Plus, Minus } from '@/svg';
import {
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import styles from './checkout-order-area.module.css';

// Custom styles for quantity controls
const quantityStyle = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    padding: '4px 0',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '1px solid #e5e5e5',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonHover: {
    background: '#f5f5f5',
  },
  quantity: {
    margin: '0 10px',
    fontWeight: '500',
    minWidth: '24px',
    textAlign: 'center',
  },
};

export default function CheckoutOrderArea({ checkoutData, isGuest }) {
  const dispatch = useDispatch();

  // Save discount values locally to preserve during checkout
  const [savedAddressDiscount, setSavedAddressDiscount] = useState(0);
  const [savedDiscountEligible, setSavedDiscountEligible] = useState(null);
  const [savedDiscountMessage, setSavedDiscountMessage] = useState('');

  const {
    handleShippingCost,
    cartTotal = 0,
    stripe,
    isCheckoutSubmit,
    clientSecret,
    register,
    errors,
    showCard,
    setShowCard,
    shippingCost,
    discountAmount,
    processingPayment,
    cardError,
    address_discount_eligible,
    address_discount_message,
    addressDiscountAmount,
    handleCouponCode,
    couponRef,
    couponApplyMsg,
  } = checkoutData;
  const { cart_products, totalShippingCost, shippingDiscount } = useSelector(
    state => state.cart
  );
  const { total, totalWithShipping } = useCartInfo();
  const { isCheckoutSubmitting } = useSelector(state => state.order);
  const { coupon_info } = useSelector(state => state.coupon);

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

  return (
    <div className={styles.orderSummary}>
      <h3 className={styles.summaryTitle}>Your Order</h3>

      <div className={styles.productList}>
        <ul>
          <li className="tp-order-info-list-header">
            <h4>Product</h4>
            <h4>Total</h4>
          </li>

          {cart_products.map(item => (
            <li key={item._id} className={styles.productItem}>
              <div className="d-flex align-items-start justify-content-between w-100">
                <div className={styles.productDetails}>
                  <p className={styles.productName}>
                    {item.title}
                    {item.selectedOption && (
                      <span className={styles.productOption}>
                        Option: {item.selectedOption.title} (+$
                        {Number(item.selectedOption.price).toFixed(2)})
                      </span>
                    )}
                  </p>

                  <div className={styles.quantityControls}>
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className={styles.quantityBtn}
                      disabled={
                        isCheckoutSubmit ||
                        processingPayment ||
                        item.orderQuantity <= 1
                      }
                      title="Decrease quantity"
                    >
                      <Minus width={14} height={14} />
                    </button>
                    <span className={styles.quantityValue}>
                      {item.orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(item)}
                      className={styles.quantityBtn}
                      disabled={isCheckoutSubmit || processingPayment}
                      title="Increase quantity"
                    >
                      <Plus width={14} height={14} />
                    </button>
                    <span className={styles.productPrice}>
                      ${item.price.toFixed(2)} each
                    </span>
                  </div>
                </div>
                <span className={styles.productTotal}>
                  ${(item.price * item.orderQuantity).toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.discountSection}>
        <div className={styles.discountHeader}>
          <svg
            className={styles.discountIcon}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className={styles.discountTitle}>Discount code</span>
        </div>
        <div className={styles.discountForm}>
          <input
            ref={couponRef}
            type="text"
            placeholder="Discount code"
            className={styles.discountInput}
          />
          <button
            type="button"
            onClick={handleCouponCode}
            className={styles.discountButton}
          >
            Apply
          </button>
        </div>
        {couponApplyMsg && (
          <div className={styles.couponMessage}>{couponApplyMsg}</div>
        )}
      </div>

      <div className={styles.summaryBreakdown}>
        <ul>
          <li className="tp-order-info-list-shipping">
            <span>Shipping</span>
            <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
              <span className="calculated-shipping">
                <input
                  {...register(`shippingOption`, {
                    required: `Shipping Option is required!`,
                  })}
                  id="calculated_shipping"
                  type="radio"
                  name="shippingOption"
                  defaultChecked
                />
                <label
                  onClick={() => handleShippingCost(totalShippingCost)}
                  htmlFor="calculated_shipping"
                >
                  Calculated Shipping:{' '}
                  <span>${totalShippingCost.toFixed(2)}</span>
                  {discountPercentage > 0 && (
                    <span className="shipping-discount-badge text-white ms-2 badge bg-success">
                      {discountPercentage}% off
                    </span>
                  )}
                </label>
                <ErrorMsg msg={errors?.shippingOption?.message} />
              </span>
            </div>
          </li>

          <li className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal</span>
            <span className={styles.summaryValue}>${total.toFixed(2)}</span>
          </li>

          <li className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Shipping</span>
            <span className={styles.summaryValue}>
              ${totalShippingCost.toFixed(2)}
            </span>
          </li>

          <li className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Discount</span>
            <span className={`${styles.summaryValue} ${styles.discount}`}>
              -${(discountAmount + displayAddressDiscount).toFixed(2)}
            </span>
          </li>

          <li className={styles.summaryRow}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.summaryLabel}>Address Discount</span>
              {displayDiscountMessage && (
                <div className="ms-2" style={{ position: 'relative' }}>
                  <div
                    className="info-icon"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: displayDiscountEligible
                        ? '#28a745'
                        : '#f8f9fa',
                      border: `1px solid ${
                        displayDiscountEligible ? '#28a745' : '#dc3545'
                      }`,
                      color: displayDiscountEligible ? 'white' : '#dc3545',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: isCheckoutSubmit ? 0.8 : 1,
                    }}
                    title={displayDiscountMessage}
                  >
                    {displayDiscountEligible ? '✓' : '!'}
                    <span
                      className="tooltip-text"
                      style={{
                        visibility: 'hidden',
                        width: '250px',
                        backgroundColor: displayDiscountEligible
                          ? '#28a745'
                          : '#6c757d',
                        color: '#fff',
                        textAlign: 'center',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        position: 'absolute',
                        zIndex: 1,
                        bottom: '125%',
                        left: '50%',
                        marginLeft: '-125px',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        fontSize: '13px',
                        pointerEvents: isCheckoutSubmit ? 'none' : 'auto',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {displayDiscountEligible
                          ? '✓ Eligible for Discount'
                          : 'Not eligible'}
                      </div>
                      <div>{displayDiscountMessage}</div>
                      {!displayDiscountEligible && (
                        <div
                          className="mt-2"
                          style={{
                            fontSize: '12px',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            padding: '5px',
                            borderRadius: '4px',
                          }}
                        >
                          <div>
                            Try a different shipping address to qualify for the
                            10% discount.
                          </div>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              )}
              {!displayDiscountMessage && !isCheckoutSubmit && !isGuest && (
                <div className="ms-2">
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>
                    (Check eligibility in billing details)
                  </span>
                </div>
              )}
            </div>
            <span
              className={`${styles.summaryValue} ${
                displayAddressDiscount > 0 ? styles.discount : ''
              }`}
            >
              ${displayAddressDiscount.toFixed(2)}
              {displayAddressDiscount > 0 && (
                <span className={styles.discountBadge}>10% OFF</span>
              )}
            </span>
          </li>

          <li className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>
              ${(totalWithShipping - discountAmount).toFixed(2)}
              {displayAddressDiscount > 0 && (
                <div
                  style={{
                    fontSize: '13px',
                    color: '#28a745',
                    opacity: isCheckoutSubmit ? 0.9 : 1,
                  }}
                >
                  Include 10% discount
                </div>
              )}
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.paymentSection}>
        <div className={styles.paymentOption}>
          <input
            {...register(`payment`, {
              required: `Payment Option is required!`,
            })}
            type="radio"
            id="back_transfer"
            name="payment"
            value="Card"
            className={styles.paymentRadio}
          />
          <label
            onClick={() => setShowCard(true)}
            htmlFor="back_transfer"
            className={styles.paymentLabel}
          >
            Credit Card
          </label>
        </div>
        {showCard && (
          <div className={styles.cardElement}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
            {cardError && (
              <div className={styles.paymentError}>
                <small>Payment could not be processed:</small>
                <strong>{cardError}</strong>
                <div>
                  <small>Please check your card details and try again.</small>
                </div>
              </div>
            )}
          </div>
        )}
        <ErrorMsg msg={errors?.payment?.message} />
      </div>

      <button
        type="submit"
        disabled={!stripe || isCheckoutSubmit || processingPayment}
        className={styles.checkoutButton}
      >
        {processingPayment ? (
          <span>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Processing Your Order...
          </span>
        ) : (
          'Complete Purchase'
        )}
      </button>

      {cardError && (
        <div className="text-center mt-3">
          <small className="text-danger">
            Please fix the payment errors above before continuing.
          </small>
        </div>
      )}

      <div className={styles.securityBadge}>
        <svg
          className={styles.securityIcon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <div className={styles.securityText}>
            Secure Checkout - SSL Encrypted
          </div>
          <div className={styles.securitySubtext}>
            Ensuring your financial and personal details are secure during every
            transaction.
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-icon:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
