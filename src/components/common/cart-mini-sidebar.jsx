'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
// import RenderCartProgress from './render-cart-progress';
import empty_cart_img from '@assets/img/product/cartmini/empty-cart.png';
import {
  closeCartMini,
  remove_product,
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import styles from './cart-mini-sidebar.module.css';

export default function CartMiniSidebar() {
  const { cart_products, cartMiniOpen, firstTimeDiscount } = useSelector(
    state => state.cart
  );
  const { total, subtotal, firstTimeDiscountAmount } = useCartInfo();
  const dispatch = useDispatch();

  // Debug logging for troubleshooting
  console.log('🛒 Cart Mini Sidebar State:', {
    cartMiniOpen,
    showCelebration: firstTimeDiscount.showCelebration,
    isApplied: firstTimeDiscount.isApplied,
    cartLength: cart_products.length,
  });

  // handle remove product
  const handleRemovePrd = prd => {
    dispatch(remove_product(prd));
  };

  // handle close cart mini
  const handleCloseCartMini = () => {
    console.log('🔄 Closing cart mini sidebar...');
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
            {/* <div className="cartmini__shipping">
              <RenderCartProgress />
            </div> */}
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
          <div className={styles.cartMiniCheckout}>
            <div className={styles.cartMiniCheckoutSummary}>
              {/* Show subtotal if discount is applied */}
              {firstTimeDiscount.isApplied && (
                <div className={styles.cartMiniCheckoutLine}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              )}
              {/* Show first-time discount */}
              {firstTimeDiscount.isApplied && (
                <div
                  className={`${styles.cartMiniCheckoutLine} ${styles.discountLine}`}
                >
                  <span>
                    First-time discount (-{firstTimeDiscount.percentage}%):
                  </span>
                  <span>-${firstTimeDiscountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className={styles.cartMiniCheckoutTitle}>
              <h4>Total:</h4>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className={styles.cartMiniCheckoutBtn}>
              <Link
                href="/cart"
                onClick={handleCloseCartMini}
                className={styles.tpBtn}
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={handleCloseCartMini}
                className={`${styles.tpBtn} ${styles.tpBtnBorder}`}
              >
                Checkout
              </Link>
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
