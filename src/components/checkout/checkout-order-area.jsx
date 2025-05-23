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

export default function CheckoutOrderArea({ checkoutData }) {
  const dispatch = useDispatch();

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

  // handle add product quantity
  const handleAddProduct = product => {
    dispatch(add_cart_product(product));
  };

  // handle decrement product quantity
  const handleDecrement = product => {
    dispatch(quantityDecrement(product));
  };

  return (
    <div className="tp-checkout-place white-bg">
      <h3 className="tp-checkout-place-title">Your Order</h3>

      <div className="tp-order-info-list">
        <ul>
          {/*  header */}
          <li className="tp-order-info-list-header">
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Product</h4>
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Total</h4>
          </li>

          {/*  item list */}
          {cart_products.map(item => (
            <li key={item._id} className="tp-order-info-list-desc">
              <div className="d-flex align-items-start justify-content-between w-100">
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: '500',
                      marginBottom: '5px',
                      fontSize: '15px',
                    }}
                  >
                    {item.title}
                    {item.selectedOption && (
                      <span
                        style={{
                          fontWeight: 'normal',
                          fontSize: '13px',
                          display: 'block',
                          color: '#666',
                          marginTop: '2px',
                        }}
                      >
                        Option: {item.selectedOption.title} (+$
                        {Number(item.selectedOption.price).toFixed(2)})
                      </span>
                    )}
                  </p>

                  {/* Quantity control */}
                  <div
                    style={quantityStyle.container}
                    className="quantity-control"
                  >
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className="quantity-btn"
                      style={quantityStyle.button}
                      disabled={
                        isCheckoutSubmit ||
                        processingPayment ||
                        item.orderQuantity <= 1
                      }
                      title="Decrease quantity"
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#d5d5d5';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#e5e5e5';
                      }}
                    >
                      <Minus width={14} height={14} />
                    </button>
                    <span style={quantityStyle.quantity}>
                      {item.orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(item)}
                      className="quantity-btn"
                      style={quantityStyle.button}
                      disabled={isCheckoutSubmit || processingPayment}
                      title="Increase quantity"
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#d5d5d5';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#e5e5e5';
                      }}
                    >
                      <Plus width={14} height={14} />
                    </button>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#777',
                        marginLeft: '10px',
                      }}
                    >
                      ${item.price.toFixed(2)} each
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    minWidth: '80px',
                    textAlign: 'right',
                  }}
                >
                  ${(item.price * item.orderQuantity).toFixed(2)}
                </span>
              </div>
            </li>
          ))}

          {/* Shipping info - updated with better styling */}
          <li className="tp-order-info-list-shipping">
            <span style={{ fontWeight: '500' }}>Shipping</span>
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
                  style={{ marginLeft: '5px', fontWeight: 'normal' }}
                >
                  Calculated Shipping:{' '}
                  <span style={{ fontWeight: '500' }}>
                    ${totalShippingCost.toFixed(2)}
                  </span>
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

          {/* Summary section with improved styling */}
          <li className="tp-order-info-list-subtotal">
            <span style={{ fontWeight: '500' }}>Subtotal</span>
            <span style={{ fontWeight: '500' }}>${total.toFixed(2)}</span>
          </li>

          <li className="tp-order-info-list-subtotal">
            <span style={{ fontWeight: '500' }}>Shipping Cost</span>
            <span style={{ fontWeight: '500' }}>
              ${totalShippingCost.toFixed(2)}
            </span>
          </li>

          <li className="tp-order-info-list-subtotal">
            <span style={{ fontWeight: '500' }}>Discount</span>
            <span
              style={{
                fontWeight: '500',
                color: discountAmount > 0 ? '#d04242' : 'inherit',
              }}
            >
              ${discountAmount.toFixed(2)}
            </span>
          </li>

          <li className="tp-order-info-list-total">
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Total</span>
            <span
              style={{ fontSize: '18px', fontWeight: '700', color: '#222' }}
            >
              ${(totalWithShipping - discountAmount).toFixed(2)}
            </span>
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
            style={{ fontWeight: '500', marginLeft: '5px' }}
          >
            Credit Card
          </label>
          {showCard && (
            <div
              className="direct-bank-transfer"
              style={{
                marginTop: '15px',
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '6px',
              }}
            >
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
      </div>

      <div className="tp-checkout-btn-wrapper" style={{ marginTop: '25px' }}>
        <button
          type="submit"
          disabled={!stripe || isCheckoutSubmit || processingPayment}
          className="tp-checkout-btn w-100"
          style={{
            transition: 'all 0.3s ease',
            opacity: !stripe || isCheckoutSubmit || processingPayment ? 0.7 : 1,
          }}
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
