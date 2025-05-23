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
    cardError,
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

          {/*  subtotal */}
          <li className="tp-order-info-list-subtotal">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </li>

          {/*  shipping cost */}
          <li className="tp-order-info-list-subtotal">
            <span>Shipping Cost</span>
            <span>${totalShippingCost.toFixed(2)}</span>
          </li>

          {/* discount */}
          <li className="tp-order-info-list-subtotal">
            <span>Discount</span>
            <span>${discountAmount.toFixed(2)}</span>
          </li>

          {/* total */}
          <li className="tp-order-info-list-total">
            <span>Total</span>
            <span>${(totalWithShipping - discountAmount).toFixed(2)}</span>
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
          >
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
              </div>
              {cardError && (
                <div
                  className="alert alert-danger mt-3 payment-error"
                  role="alert"
                >
                  <small className="d-block mb-1">
                    Payment could not be processed:
                  </small>
                  <strong>{cardError}</strong>
                  <div className="mt-2">
                    <small>Please check your card details and try again.</small>
                  </div>
                </div>
              )}
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
        {/* <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: `Payment Option is required!`,
            })}
            onClick={() => setShowCard(false)}
            type="radio"
            id="cod"
            name="payment"
            value="COD"
          />
          <label htmlFor="cod">Cash on Delivery</label>
          <ErrorMsg msg={errors?.payment?.message} />
        </div> */}
      </div>

      <div className="tp-checkout-btn-wrapper">
        <button
          type="submit"
          disabled={!stripe || isCheckoutSubmit || processingPayment}
          className="tp-checkout-btn w-100"
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
            <>Complete Purchase</>
          )}
        </button>
        {cardError && (
          <div className="text-center mt-3">
            <small className="text-danger">
              Please fix the payment errors above before continuing.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
