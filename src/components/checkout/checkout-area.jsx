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
      <section className="bg-background rounded-lg shadow-sm p-4 md:p-6 mb-8">
        <div className="">
          {cart_products.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                No items found in cart to checkout
              </h3>
              <Link
                href="/shop"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Return to shop
              </Link>
            </div>
          )}
          {cart_products.length > 0 && (
            <form onSubmit={handleSubmit(submitHandler)} noValidate>
              {/* Mobile: Order summary first, then billing details */}
              {/* Desktop: Order summary on left (sticky), billing details on right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Order summary - full width on mobile, 5/12 width on desktop (sticky) */}
                <div className="lg:col-span-5 lg:sticky lg:top-4 lg:self-start">
                  <CheckoutOrderArea
                    checkoutData={checkoutData}
                    isGuest={isGuest}
                  />
                </div>

                {/* Billing details - full width on mobile, 7/12 width on desktop */}
                <div className="lg:col-span-7">
                  <div className="space-y-6">
                    {isGuest && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              ?
                            </div>
                            <span className="font-medium text-foreground">
                              Checking out as Guest
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={loginWithRedirect}
                            className="text-primary hover:text-primary/90 underline"
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
                      checkoutData={checkoutData}
                    />
                  </div>
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
