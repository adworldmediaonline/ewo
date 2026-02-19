'use client';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { AddToCartAnimationProvider } from '@/context/add-to-cart-animation-context';
import CartConfirmationModal from '@/components/modals/cart-confirmation-modal';

import {
  get_cart_products,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { get_compare_products } from '@/redux/features/compareSlice';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  // const { productItem } = useSelector((state: any) => state.productModal);
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Defer Redux initialization to reduce Total Blocking Time
    // Use requestIdleCallback to load after initial paint, or fallback to setTimeout
    const initializeRedux = () => {
      if (!hasInitialized.current) {
        dispatch(get_cart_products());
        dispatch(get_wishlist_products());
        dispatch(get_compare_products());
        dispatch(initialOrderQuantity());
        hasInitialized.current = true;
      }
    };

    // Use requestIdleCallback if available (runs when browser is idle)
    // Fallback to setTimeout for browsers that don't support it
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(initializeRedux, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback: defer to after first paint (100ms delay)
      const timeoutId = setTimeout(initializeRedux, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch]);

  return (
    <AddToCartAnimationProvider>
      <div id="wrapper">
        {children}
        <CartConfirmationModal />
      </div>
    </AddToCartAnimationProvider>
  );
};

export default Wrapper;
