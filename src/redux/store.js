import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authSlice from './features/auth/authSlice';
import cartSlice from './features/cartSlice';
import orderSlice from './features/order/orderSlice';
import couponSlice from './features/coupon/couponSlice';
import wishlistSlice from './features/wishlist-slice';
import compareSlice from './features/compareSlice';
import guestCartSlice from './features/guestCart/guestCartSlice';
import productModalSlice from './features/productModalSlice';
import shopFilterSlice from './features/shop-filter-slice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    cart: cartSlice,
    order: orderSlice,
    coupon: couponSlice,
    wishlist: wishlistSlice,
    compare: compareSlice,
    guestCart: guestCartSlice,
    productModal: productModalSlice,
    shopFilter: shopFilterSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
