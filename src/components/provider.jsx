'use client';
import store from '@/redux/store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Provider } from 'react-redux';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>{children}</Elements>
    </Provider>
  );
};

export default Providers;
