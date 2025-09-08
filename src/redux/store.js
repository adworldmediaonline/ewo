import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import cartSlice from './features/cartSlice';
import compareSlice from './features/compareSlice';
import couponSlice from './features/coupon/couponSlice';
import guestCartSlice from './features/guestCart/guestCartSlice';
import orderSlice from './features/order/orderSlice';
import productModalSlice from './features/productModalSlice';
import shopFilterSlice from './features/shop-filter-slice';
import wishlistSlice from './features/wishlist-slice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
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
