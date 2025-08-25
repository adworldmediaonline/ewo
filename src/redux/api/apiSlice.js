import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  //   prepareHeaders: async (headers, { getState, endpoint }) => {
  //     try {
  //       // Use Better Auth session instead of cookies
  //       const { data: session } = await authClient.getSession();
  //       if (session?.accessToken) {
  //         headers.set('Authorization', `Bearer ${session.accessToken}`);
  //       }
  //     } catch (error) {
  //       // Handle error silently
  //     }
  //     return headers;
  //   },
  // }),
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
