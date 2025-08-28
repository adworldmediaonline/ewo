'use client';
import { initializeAuth } from '@/redux/features/auth/authSlice';
import store from '@/redux/store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import CouponRevalidationWrapper from './coupon-revalidation-wrapper';

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

// Component to initialize auth state
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize authentication state when the app loads
    dispatch(initializeAuth());
  }, [dispatch]);

  return children;
};

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <AuthInitializer>
          <CouponRevalidationWrapper>{children}</CouponRevalidationWrapper>
        </AuthInitializer>
      </Elements>
    </Provider>
  );
};

export default Providers;
