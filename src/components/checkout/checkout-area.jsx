'use client';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// internal
import useCheckoutSubmit from '@/hooks/use-checkout-submit';
import ThankYouModal from '../common/thank-you-modal';

import CheckoutBillingArea from './checkout-billing-area';
import CheckoutOrderArea from './checkout-order-area';

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
    setValue,
    handleCouponCode,
    couponRef,
    couponApplyMsg,
    // Thank You Modal props
    showThankYouModal,
    orderDataForModal,
    handleThankYouModalClose,
    handleThankYouModalContinue,
  } = checkoutData;
  const { cart_products } = useSelector(state => state.cart);

  // Code to add "Sign in" link for guest users that redirects back to checkout
  const loginWithRedirect = () => {
    router.push('/login?redirect=/checkout');
  };

  return (
    <>
      <section className="">
        <div className="">
          {cart_products.length === 0 && (
            <div className="">
              <h3 className="">No items found in cart to checkout</h3>
              <Link href="/shop" className="">
                Return to shop
              </Link>
            </div>
          )}
          {cart_products.length > 0 && (
            <form onSubmit={handleSubmit(submitHandler)} noValidate>
              <div className="">
                <div className="">
                  {isGuest && (
                    <div className="">
                      <div className="">
                        <div className="">
                          <div className="">?</div>
                          <span className="">Checking out as Guest</span>
                        </div>
                        <button
                          type="button"
                          onClick={loginWithRedirect}
                          className=""
                        >
                          Sign In Instead
                        </button>
                      </div>
                    </div>
                  )}
                  <CheckoutBillingArea
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    isGuest={isGuest}
                  />
                </div>
                <div className="">
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

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={handleThankYouModalClose}
        orderData={orderDataForModal}
        onContinue={handleThankYouModalContinue}
      />
    </>
  );
}
