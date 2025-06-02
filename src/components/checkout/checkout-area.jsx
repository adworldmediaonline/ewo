'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
// internal
import CheckoutBillingArea from './checkout-billing-area';
import CheckoutOrderArea from './checkout-order-area';
import useCheckoutSubmit from '@/hooks/use-checkout-submit';
import styles from './checkout-area.module.css';

export default function CheckoutArea() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const isAuthenticate = Cookies.get('userInfo');
    if (!isAuthenticate) {
      setIsGuest(true);
    }
  }, []);

  const checkoutData = useCheckoutSubmit();
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    handleCouponCode,
    couponRef,
    couponApplyMsg,
    checkAddressDiscountEligibility,
  } = checkoutData;
  const { cart_products } = useSelector(state => state.cart);

  // Code to add "Sign in" link for guest users that redirects back to checkout
  const loginWithRedirect = () => {
    router.push('/login?redirect=/checkout');
  };

  return (
    <section className={styles.checkoutArea}>
      <div className={styles.container}>
        {cart_products.length === 0 && (
          <div className={styles.emptyCart}>
            <h3 className={styles.emptyCartTitle}>
              No items found in cart to checkout
            </h3>
            <Link href="/shop" className={styles.returnToShopBtn}>
              Return to shop
            </Link>
          </div>
        )}
        {cart_products.length > 0 && (
          <form onSubmit={handleSubmit(submitHandler)} noValidate>
            <div className={styles.checkoutGrid}>
              <div className={styles.leftColumn}>
                {isGuest && (
                  <div className={styles.guestSection}>
                    <div className={styles.guestContent}>
                      <div className={styles.guestInfo}>
                        <div className={styles.guestIcon}>?</div>
                        <span className={styles.guestText}>
                          Checking out as Guest
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={loginWithRedirect}
                        className={styles.signInBtn}
                      >
                        Sign In Instead
                      </button>
                    </div>
                  </div>
                )}
                <CheckoutBillingArea
                  register={register}
                  errors={errors}
                  isGuest={isGuest}
                  checkAddressDiscount={checkAddressDiscountEligibility}
                />
              </div>
              <div className={styles.rightColumn}>
                <CheckoutOrderArea
                  checkoutData={checkoutData}
                  isGuest={isGuest}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
