'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// internal
import BackToTopCom from '@/components/common/back-to-top';
import ProductModal from '@/components/common/product-modal';
import Loader from '@/components/loader/loader';
import CartConfirmationModal from '@/components/modals/cart-confirmation-modal';
import GuestCartModal from '@/components/modals/guest-cart-modal';
import useAuthCheck from '@/hooks/use-auth-check';
import {
  get_cart_products,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { get_compare_products } from '@/redux/features/compareSlice';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';
import { forceToastCenter } from '@/utils/toast-center';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const { productItem } = useSelector((state: any) => state.productModal);
  const dispatch = useDispatch();
  const authChecked = useAuthCheck();

  useEffect(() => {
    dispatch(get_cart_products());
    dispatch(get_wishlist_products());
    dispatch(get_compare_products());
    dispatch(initialOrderQuantity());

    // Initialize toast centering
    const cleanup = forceToastCenter();

    return cleanup;
  }, [dispatch]);

  return !authChecked ? (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: '100vh' }}
    >
      <Loader spinner="fade" loading={!authChecked} />
    </div>
  ) : (
    <div id="wrapper">
      {children}
      <BackToTopCom cls="" />
      <ToastContainer
        position="top-center"
        autoClose={400}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Zoom}
        limit={5}
        className="custom-toast-container"
        toastClassName="custom-toast"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          maxWidth: '400px',
          minWidth: '300px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <GuestCartModal />
      <CartConfirmationModal />
      {/* product modal start */}
      {productItem && <ProductModal />}
      {/* product modal end */}
    </div>
  );
};

export default Wrapper;
