'use client';
import React from 'react';
import Link from 'next/link';
import useCartInfo from '@/hooks/use-cart-info';
import { useState } from 'react';
import styles from '../../app/cart/cart.module.css';
import { useSelector } from 'react-redux';

export default function CartCheckout() {
  const { total, totalWithShipping } = useCartInfo();
  const { totalShippingCost, shippingDiscount } = useSelector(
    state => state.cart
  );

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

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
              <span className={styles['checkout-shipping-label']}>
                Calculated shipping:{' '}
                <span className={styles['checkout-shipping-price']}>
                  ${totalShippingCost.toFixed(2)}
                </span>
                {discountPercentage > 0 && (
                  <span
                    className={`${styles['checkout-shipping-discount']} ms-2 badge bg-success`}
                  >
                    {discountPercentage}% off
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className={styles['checkout-total']}>
          <span className={styles['checkout-total-label']}>Total</span>
          <span className={styles['checkout-total-value']}>
            ${(total + totalShippingCost).toFixed(2)}
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
}
