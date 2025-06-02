'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
if (typeof window !== 'undefined') {
  require('bootstrap/dist/js/bootstrap');
}
// internal
import BackToTopCom from '@/components/common/back-to-top';
import ProductModal from '@/components/common/product-modal';
import {
  get_cart_products,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';
import { get_compare_products } from '@/redux/features/compareSlice';
import useAuthCheck from '@/hooks/use-auth-check';
import Loader from '@/components/loader/loader';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { forceToastCenter } from '@/utils/toast-center';

const Wrapper = ({ children }) => {
  const { productItem } = useSelector(state => state.productModal);
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
      <BackToTopCom />
      <ToastContainer
        position="top-center"
        autoClose={1000}
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
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      {/* product modal start */}
      {productItem && <ProductModal />}
      {/* product modal end */}
    </div>
  );
};

export default Wrapper;
