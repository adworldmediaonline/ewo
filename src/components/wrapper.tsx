'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// import ProductModal from '@/components/common/product-modal';
import CartConfirmationModal from '@/components/modals/cart-confirmation-modal';

import {
  get_cart_products,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { get_compare_products } from '@/redux/features/compareSlice';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';
import { usePathname } from 'next/navigation';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  // const { productItem } = useSelector((state: any) => state.productModal);
  const dispatch = useDispatch();
  const pathname = usePathname();
  useEffect(() => {
    dispatch(get_cart_products());
    dispatch(get_wishlist_products());
    dispatch(get_compare_products());
    dispatch(initialOrderQuantity());
  }, [dispatch]);

  useEffect(() => {
    // Scroll to top for shop page and any shop-related navigation
    if (pathname.startsWith('/shop')) {
      // Use a small delay to ensure the page has loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [pathname]);

  return (
    <div id="wrapper">
      {children}
      <CartConfirmationModal />
      {/* {productItem && <ProductModal />} */}
    </div>
  );
};

export default Wrapper;
