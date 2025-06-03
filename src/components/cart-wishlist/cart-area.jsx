'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
// internal
import { clearCart } from '@/redux/features/cartSlice';
import CartCheckout from './cart-checkout';
import CartItem from './cart-item';
import styles from './cart-area.module.css';
// import RenderCartProgress from '../common/render-cart-progress';

export default function CartArea() {
  const { cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {cart_products.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyCartContent}>
              <div className={styles.emptyCartIcon}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className={styles.emptyCartTitle}>Your Cart is Empty</h2>
              <p className={styles.emptyCartText}>
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link href="/shop" className={styles.continueShoppingBtn}>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.cartContent}>
            {/* Simple Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h1 className={styles.title}>Shopping Cart</h1>
                <p className={styles.itemsCount}>
                  {cart_products.length}{' '}
                  {cart_products.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={() => dispatch(clearCart())}
                type="button"
                className={styles.clearCartBtn}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Clear Cart
              </button>
            </div>

            <div className={styles.grid}>
              {/* Cart Items */}
              <div className={styles.cartItemsSection}>
                <div className={styles.cartItemsList}>
                  {cart_products.map((item, i) => (
                    <CartItem key={i} product={item} />
                  ))}
                </div>
              </div>

              {/* Cart Checkout */}
              <div className={styles.checkoutSection}>
                <CartCheckout />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
