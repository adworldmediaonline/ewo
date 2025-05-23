'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
// internal
import CheckoutBillingArea from './checkout-billing-area';
import CheckoutCoupon from './checkout-coupon';
import CheckoutLogin from './checkout-login';
import CheckoutOrderArea from './checkout-order-area';
import useCheckoutSubmit from '@/hooks/use-checkout-submit';

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
    setValue,
  } = checkoutData;
  const { cart_products } = useSelector(state => state.cart);

  // Code to add "Sign in" link for guest users that redirects back to checkout
  const loginWithRedirect = () => {
    router.push('/login?redirect=/checkout');
  };

  return (
    <>
      <section
        className="tp-checkout-area pb-120"
        style={{ backgroundColor: '#EFF1F5' }}
      >
        <div className="container">
          {cart_products.length === 0 && (
            <div className="text-center pt-50">
              <h3 className="py-2">No items found in cart to checkout</h3>
              <Link href="/shop" className="tp-checkout-btn">
                Return to shop
              </Link>
            </div>
          )}
          {cart_products.length > 0 && (
            <div className="row">
              <div className="col-xl-7 col-lg-7">
                <div className="tp-checkout-verify">
                  {isGuest && (
                    <div className="tp-checkout-login mb-25">
                      <h5 className="tp-checkout-login-title">
                        Checking out as guest
                      </h5>
                      <div className="tp-checkout-login-form">
                        <div className="tp-checkout-login-form-wrapper">
                          <div className="tp-checkout-login-btn-wrapper">
                            <button
                              type="button"
                              onClick={loginWithRedirect}
                              className="tp-checkout-btn"
                            >
                              Sign in instead
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isGuest && <CheckoutLogin />}
                  <CheckoutCoupon
                    handleCouponCode={handleCouponCode}
                    couponRef={couponRef}
                    couponApplyMsg={couponApplyMsg}
                  />
                </div>
              </div>
              <form onSubmit={handleSubmit(submitHandler)}>
                <div className="row">
                  <div className="col-lg-7">
                    <CheckoutBillingArea
                      register={register}
                      errors={errors}
                      isGuest={isGuest}
                    />
                  </div>
                  <div className="col-lg-5">
                    <CheckoutOrderArea
                      checkoutData={checkoutData}
                      isGuest={isGuest}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
