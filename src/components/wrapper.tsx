'use client';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

// import ProductModal from '@/components/common/product-modal';
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
    // Only load cart products once on initial mount
    // This prevents resetting the cart confirmation modal state when items are added
    if (!hasInitialized.current) {
      dispatch(get_cart_products());
      dispatch(get_wishlist_products());
      dispatch(get_compare_products());
      dispatch(initialOrderQuantity());
      hasInitialized.current = true;
    }
  }, [dispatch]);

  return (
    <div id="wrapper">
      {children}
      <CartConfirmationModal />
      {/* {productItem && <ProductModal />} */}
    </div>
  );
};

export default Wrapper;
