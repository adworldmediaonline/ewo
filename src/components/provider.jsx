'use client';
import { Suspense } from 'react';
import store from '@/redux/store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Provider } from 'react-redux';
import CouponRevalidationWrapper from './coupon-revalidation-wrapper';

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        {/* CouponRevalidationWrapper uses Redux hooks - wrap in Suspense */}
        <Suspense fallback={null}>
          <CouponRevalidationWrapper>{children}</CouponRevalidationWrapper>
        </Suspense>
      </Elements>
    </Provider>
  );
};

export default Providers;
