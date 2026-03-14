'use client';
import store from '@/redux/store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Provider } from 'react-redux';
import { AuthDialogProvider } from '@/context/auth-dialog-context';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthDialogProvider>
        <Elements stripe={stripePromise}>{children}</Elements>
      </AuthDialogProvider>
    </Provider>
  );
};

export default Providers;
