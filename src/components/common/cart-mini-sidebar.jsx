'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
// import RenderCartProgress from './render-cart-progress';
import empty_cart_img from '@assets/img/product/cartmini/empty-cart.png';
import { closeCartMini, remove_product } from '@/redux/features/cartSlice';
import styles from './cart-mini-sidebar.module.css';

export default function CartMiniSidebar() {
  const { cart_products, cartMiniOpen } = useSelector(state => state.cart);
  const { total } = useCartInfo();
  const dispatch = useDispatch();

  // handle remove product
  const handleRemovePrd = prd => {
    dispatch(remove_product(prd));
  };

  // handle close cart mini
  const handleCloseCartMini = () => {
    dispatch(closeCartMini());
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
                        {item.discount > 0 ? (
                          <span className={styles.cartMiniPrice}>
                            $
                            {(
                              Number(item.price) -
                              (Number(item.price) * Number(item.discount)) / 100
                            ).toFixed(2)}
                          </span>
                        ) : (
                          <span className={styles.cartMiniPrice}>
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                        <span className={styles.cartMiniQuantity}>
                          Qty: {item.orderQuantity}
                        </span>
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
            <div className={styles.cartMiniCheckoutTitle}>
              <h4>Subtotal:</h4>
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
