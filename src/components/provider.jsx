'use client';
import store from '@/redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Provider } from 'react-redux';
import CouponRevalidationWrapper from './coupon-revalidation-wrapper';

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Providers = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Elements stripe={stripePromise}>
          <CouponRevalidationWrapper>{children}</CouponRevalidationWrapper>
        </Elements>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default Providers;
