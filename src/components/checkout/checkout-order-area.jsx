'use client';
import { useState, useEffect } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import ErrorMsg from '../common/error-msg';

export default function CheckoutOrderArea({ checkoutData }) {
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
    orderReferenceId,
  } = checkoutData;
  const { cart_products, totalShippingCost, shippingDiscount } = useSelector(
    state => state.cart
  );
  const { total, totalWithShipping } = useCartInfo();

  // Update shipping cost in checkout data when it changes
  useEffect(() => {
    handleShippingCost(totalShippingCost);
  }, [totalShippingCost, handleShippingCost]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

  // Calculate final formatted values
  const formattedSubtotal = parseFloat(total.toFixed(2));
  const formattedShipping = parseFloat(totalShippingCost.toFixed(2));
  const formattedDiscount = parseFloat(discountAmount.toFixed(2));
  const formattedTotal = parseFloat(
    (formattedSubtotal + formattedShipping - formattedDiscount).toFixed(2)
  );

  return (
    <div className="tp-checkout-place white-bg">
      <h3 className="tp-checkout-place-title">Your Order</h3>

      <div className="tp-order-info-list">
        <ul>
          {/*  header */}
          <li className="tp-order-info-list-header">
            <h4>Product</h4>
            <h4>Total</h4>
          </li>

          {/*  item list */}
          {cart_products.map(item => (
            <li key={item._id} className="tp-order-info-list-desc">
              <p>
                {item.title} <span> x {item.orderQuantity}</span>
              </p>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}

          {/* Shipping info - updated to use calculated shipping */}
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
                  <span>${formattedShipping.toFixed(2)}</span>
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

          {/*  subtotal */}
          <li className="tp-order-info-list-subtotal">
            <span>Subtotal</span>
            <span>${formattedSubtotal.toFixed(2)}</span>
          </li>

          {/*  shipping cost */}
          <li className="tp-order-info-list-subtotal">
            <span>Shipping Cost</span>
            <span>${formattedShipping.toFixed(2)}</span>
          </li>

          {/* discount */}
          <li className="tp-order-info-list-subtotal">
            <span>Discount</span>
            <span>${formattedDiscount.toFixed(2)}</span>
          </li>

          {/* total */}
          <li className="tp-order-info-list-total">
            <span>Total</span>
            <span>${formattedTotal.toFixed(2)}</span>
          </li>
        </ul>
      </div>
      <div className="tp-checkout-payment">
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: `Payment Option is required!`,
            })}
            type="radio"
            id="back_transfer"
            name="payment"
            value="Card"
          />
          <label
            onClick={() => setShowCard(true)}
            htmlFor="back_transfer"
            data-bs-toggle="direct-bank-transfer"
            className="d-flex align-items-center"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="me-2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Credit Card
          </label>
          {showCard && (
            <div className="direct-bank-transfer">
              <div className="payment_card">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                        iconColor: '#E61E1E',
                      },
                      invalid: {
                        color: '#9e2146',
                        iconColor: '#9e2146',
                      },
                    },
                    hidePostalCode: true,
                  }}
                />
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-lock me-1"></i>
                  Your payment is secure. Your card details are encrypted.
                </small>
              </div>
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
      </div>

      <div className="tp-checkout-btn-wrapper">
        <button
          type="submit"
          disabled={!stripe || isCheckoutSubmit || processingPayment}
          className="tp-checkout-btn w-100 position-relative overflow-hidden"
        >
          {processingPayment ? (
            <span className="d-flex align-items-center justify-content-center">
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Processing Payment...
            </span>
          ) : (
            <>
              <span className="d-flex align-items-center justify-content-center">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 10 L12 14 L8 10"></path>
                </svg>
                Place Order
              </span>
              <span className="order-reference-id d-none">
                {orderReferenceId}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
