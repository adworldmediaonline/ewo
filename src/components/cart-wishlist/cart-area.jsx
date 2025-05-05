'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
// internal
import { clearCart } from '@/redux/features/cartSlice';
import CartCheckout from './cart-checkout';
import CartItem from './cart-item';
import styles from '../../app/cart/cart.module.css';
// import RenderCartProgress from '../common/render-cart-progress';

const CartArea = () => {
  const { cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  return (
    <section className={styles['cart-section']}>
      <div className="container">
        {cart_products.length === 0 ? (
          <div className={styles['empty-cart']}>
            <div className={styles['empty-cart-content']}>
              <svg
                className={styles['empty-cart-icon']}
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
              <h3>Your Cart is Empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link href="/shop" className={styles['continue-shopping-btn']}>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles['cart-content']}>
            <div className={styles['cart-header']}>
              <h2 className={styles['cart-title']}>Shopping Cart</h2>
              <p className={styles['cart-items-count']}>
                {cart_products.length}{' '}
                {cart_products.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="row">
              <div className="col-xl-9 col-lg-8">
                <div className={styles['cart-table-wrapper']}>
                  <table className={styles['cart-table']}>
                    <thead className={styles['cart-table-head']}>
                      <tr>
                        <th className={styles['product-col']}>Product</th>
                        <th className={styles['price-col']}>Price</th>
                        <th className={styles['quantity-col']}>Quantity</th>
                        <th className={styles['action-col']}></th>
                      </tr>
                    </thead>
                    <tbody className={styles['cart-table-body']}>
                      {cart_products.map((item, i) => (
                        <CartItem key={i} product={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles['cart-actions']}>
                  <div className="row align-items-end">
                    <div className="col-xl-6 col-md-8">
                      {/* Coupon area can be added back here if needed */}
                    </div>
                    <div className="col-xl-6 col-md-4">
                      <div className={styles['cart-clear-btn-wrapper']}>
                        <button
                          onClick={() => dispatch(clearCart())}
                          type="button"
                          className={styles['cart-clear-btn']}
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <CartCheckout />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartArea;
