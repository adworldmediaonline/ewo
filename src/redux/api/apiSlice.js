import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers, { getState, endpoint }) => {
      try {
        const userInfo = Cookies.get('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user?.accessToken) {
            headers.set('Authorization', `Bearer ${user.accessToken}`);
          }
        }
      } catch (error) {}
      return headers;
    },
  }),
  endpoints: builder => ({}),
  tagTypes: [
    'Products',
    'Coupon',
    'Product',
    'RelatedProducts',
    'UserOrder',
    'UserOrders',
    'ProductType',
    'OfferProducts',
    'PopularProducts',
    'TopRatedProducts',
    'GuestCart',
    'CartAnalytics',
    'Contact',
  ],
});
