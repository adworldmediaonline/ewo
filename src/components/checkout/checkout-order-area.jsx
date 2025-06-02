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
        {cart_products.map(item => (
          <div key={item._id} className={styles.productItem}>
            <div className={styles.productImage}>
              <img
                src={item.img || '/placeholder-product.png'}
                alt={item.title}
                className={styles.productImage}
              />
            </div>
            <div className={styles.productDetails}>
              <h4 className={styles.productName}>{item.title}</h4>
              {item.selectedOption && (
                <p className={styles.productOption}>
                  {item.selectedOption.title} (+$
                  {Number(item.selectedOption.price).toFixed(2)})
                </p>
              )}
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
                >
                  <Minus width={12} height={12} />
                </button>
                <span className={styles.quantityValue}>
                  {item.orderQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleAddProduct(item)}
                  className={styles.quantityBtn}
                  disabled={isCheckoutSubmit || processingPayment}
                >
                  <Plus width={12} height={12} />
                </button>
              </div>
            </div>
            <div className={styles.productTotal}>
              ${(item.price * item.orderQuantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.discountSection}>
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
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Subtotal</span>
          <span className={styles.summaryValue}>${total.toFixed(2)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Shipping</span>
          <span className={styles.summaryValue}>
            ${totalShippingCost.toFixed(2)}
            {discountPercentage > 0 && (
              <span className={styles.discountBadge}>
                {discountPercentage}% off
              </span>
            )}
          </span>
        </div>

        {discountAmount + displayAddressDiscount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Discount</span>
            <span className={`${styles.summaryValue} ${styles.discount}`}>
              -${(discountAmount + displayAddressDiscount).toFixed(2)}
            </span>
          </div>
        )}

        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>
            ${(totalWithShipping - discountAmount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h4 className={styles.paymentTitle}>Payment Information</h4>
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
                  fontFamily: 'var(--font-lato), "Lato", sans-serif',
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

      {/* Hidden payment and shipping inputs for form validation */}
      <div style={{ display: 'none' }}>
        <input
          {...register(`shippingOption`, {
            required: `Shipping Option is required!`,
          })}
          type="radio"
          name="shippingOption"
          value="calculated"
          defaultChecked
        />
        <input
          {...register(`payment`, {
            required: `Payment Option is required!`,
          })}
          type="radio"
          name="payment"
          value="Card"
          defaultChecked
        />
      </div>
    </div>
  );
}
