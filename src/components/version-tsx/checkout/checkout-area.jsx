'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
// internal
// import { AuthDialog } from '@/components/version-tsx/profile';
import useCheckoutSubmit from '@/hooks/use-checkout-submit';
import ThankYouModal from '../../common/thank-you-modal';

import { authClient } from '@/lib/authClient';
import CheckoutBillingArea from './checkout-billing-area';
import CheckoutOrderArea from './checkout-order-area';

export default function CheckoutArea() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

  // Handle auth dialog
  // const handleShowAuthDialog = () => {
  //   setShowAuthDialog(true);
  // };

  // const handleCloseAuthDialog = () => {
  //   setShowAuthDialog(false);
  // };

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
              {/* Desktop: Billing details on left, order summary on right (sticky) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Billing details - full width on mobile, 7/12 width on desktop */}
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="space-y-6">
                    {isPending && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    )}

                    {!session && !isPending && (
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
                          {/* <button
                            type="button"
                            onClick={handleShowAuthDialog}
                            className="text-primary hover:text-primary/90 underline"
                          >
                            Sign In Instead
                          </button> */}

                          <Link
                            href="/sign-in"
                            className="text-primary hover:text-primary/90 underline"
                          >
                            Sign In Instead
                          </Link>
                        </div>
                      </div>
                    )}

                    <CheckoutBillingArea
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      checkoutData={checkoutData}
                    />
                  </div>
                </div>

                {/* Order summary - full width on mobile (displayed first), 5/12 width on desktop (sticky) */}
                <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start">
                  <CheckoutOrderArea checkoutData={checkoutData} />
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Auth Dialog */}
      {/* <AuthDialog
        isOpen={showAuthDialog}
        onClose={handleCloseAuthDialog}
        redirectPath="/checkout"
        defaultTab="signin"
      /> */}

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
