// 'use client';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// // internal
// import ProductModal from '@/components/common/product-modal';
// import Loader from '@/components/loader/loader';
// import CartConfirmationModal from '@/components/modals/cart-confirmation-modal';
// import GuestCartModal from '@/components/modals/guest-cart-modal';
// // import BackToTopCom from '@/components/version-tsx/back-to-top';
// import useAuthCheck from '@/hooks/use-auth-check';
// import {
//   get_cart_products,
//   initialOrderQuantity,
// } from '@/redux/features/cartSlice';
// import { get_compare_products } from '@/redux/features/compareSlice';
// import { get_wishlist_products } from '@/redux/features/wishlist-slice';

// interface WrapperProps {
//   children: React.ReactNode;
// }

// const Wrapper = ({ children }: WrapperProps) => {
//   const { productItem } = useSelector((state: any) => state.productModal);
//   const dispatch = useDispatch();
//   const authChecked = useAuthCheck();

//   useEffect(() => {
//     dispatch(get_cart_products());
//     dispatch(get_wishlist_products());
//     dispatch(get_compare_products());
//     dispatch(initialOrderQuantity());
//   }, [dispatch]);

//   return !authChecked ? (
//     <div
//       className="d-flex align-items-center justify-content-center"
//       style={{ height: '100vh' }}
//     >
//       <Loader spinner="fade" loading={!authChecked} />
//     </div>
//   ) : (
//     <div id="wrapper">
//       {children}
//       {/* <BackToTopCom /> */}
//       <GuestCartModal />
//       <CartConfirmationModal />
//       {/* product modal start */}
//       {productItem && <ProductModal />}
//       {/* product modal end */}
//     </div>
//   );
// };

// export default Wrapper;

'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// internal
import ProductModal from '@/components/common/product-modal';
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
  const { productItem } = useSelector((state: any) => state.productModal);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(get_cart_products());
    dispatch(get_wishlist_products());
    dispatch(get_compare_products());
    dispatch(initialOrderQuantity());
  }, [dispatch]);

  // if (isPending) {
  //   return (
  //     <div
  //       className="d-flex align-items-center justify-content-center"
  //       style={{ height: '100vh' }}
  //     >
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  //     </div>
  //   );
  // }

  return (
    <div id="wrapper">
      {children}
      <CartConfirmationModal />
      {productItem && <ProductModal />}
    </div>
  );
};

export default Wrapper;
