'use client';
import React from 'react';
import Link from 'next/link';
import useCartInfo from '@/hooks/use-cart-info';
import { useState } from 'react';
import styles from '../../app/cart/cart.module.css';

const CartCheckout = () => {
  const { total } = useCartInfo();
  const [shipCost, setShipCost] = useState(0);
  // handle shipping cost
  const handleShippingCost = value => {
    if (value === 'free') {
      setShipCost(0);
    } else {
      setShipCost(value);
    }
  };
  return (
    <div className={styles['checkout-card']}>
      <div className={styles['checkout-card-header']}>
        <h3 className={styles['checkout-card-title']}>Order Summary</h3>
      </div>

      <div className={styles['checkout-card-body']}>
        <div className={styles['checkout-summary-item']}>
          <span className={styles['checkout-summary-label']}>Subtotal</span>
          <span className={styles['checkout-summary-value']}>
            ${total.toFixed(2)}
          </span>
        </div>

        <div className={styles['checkout-shipping']}>
          <h4 className={styles['checkout-shipping-title']}>Shipping</h4>

          <div className={styles['checkout-shipping-options']}>
            <div className={styles['checkout-shipping-option']}>
              <input
                id="flat_rate"
                type="radio"
                name="shipping"
                className={styles['checkout-shipping-radio']}
                onChange={() => handleShippingCost(20)}
                defaultChecked={shipCost === 20}
              />
              <label
                htmlFor="flat_rate"
                className={styles['checkout-shipping-label']}
              >
                Flat rate:{' '}
                <span className={styles['checkout-shipping-price']}>
                  $20.00
                </span>
              </label>
            </div>

            <div className={styles['checkout-shipping-option']}>
              <input
                id="local_pickup"
                type="radio"
                name="shipping"
                className={styles['checkout-shipping-radio']}
                onChange={() => handleShippingCost(25)}
                defaultChecked={shipCost === 25}
              />
              <label
                htmlFor="local_pickup"
                className={styles['checkout-shipping-label']}
              >
                Local pickup:{' '}
                <span className={styles['checkout-shipping-price']}>
                  $25.00
                </span>
              </label>
            </div>

            <div className={styles['checkout-shipping-option']}>
              <input
                id="free_shipping"
                type="radio"
                name="shipping"
                className={styles['checkout-shipping-radio']}
                onChange={() => handleShippingCost('free')}
                defaultChecked={shipCost === 0}
              />
              <label
                htmlFor="free_shipping"
                className={styles['checkout-shipping-label']}
              >
                Free shipping
              </label>
            </div>
          </div>
        </div>

        <div className={styles['checkout-total']}>
          <span className={styles['checkout-total-label']}>Total</span>
          <span className={styles['checkout-total-value']}>
            ${(total + parseFloat(shipCost)).toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles['checkout-card-footer']}>
        <Link href="/checkout" className={styles['checkout-btn']}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartCheckout;
