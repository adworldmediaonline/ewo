import { apiSlice } from '../../api/apiSlice';
import { set_client_secret, set_address_discount_eligible } from './orderSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // createPaymentIntent
    createPaymentIntent: builder.mutation({
      query: data => ({
        url: 'api/order/create-payment-intent',
        method: 'POST',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // Store the client secret and payment intent ID
          if (result.data) {
            dispatch(set_client_secret(result.data.clientSecret));
            // Store payment intent ID if needed
            if (result.data.paymentIntentId) {
              localStorage.setItem(
                'payment_intent_id',
                result.data.paymentIntentId
              );
            }
          }
        } catch (err) {
          console.error('Payment intent creation failed:', err);
        }
      },
    }),
    // checkAddressDiscount
    checkAddressDiscount: builder.mutation({
      query: data => ({
        url: 'api/order/check-address-discount',
        method: 'POST',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data) {
            dispatch(set_address_discount_eligible(result.data.eligible));
          }
        } catch (err) {
          console.error('Address discount check failed:', err);
          dispatch(set_address_discount_eligible(false));
        }
      },
    }),
    // saveOrder
    saveOrder: builder.mutation({
      query: data => ({
        url: 'api/order/saveOrder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserOrders'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result) {
            localStorage.removeItem('couponInfo');
            localStorage.removeItem('cart_products');
            localStorage.removeItem('shipping_info');
          }
        } catch (err) {
          // do nothing
        }
      },
    }),
    // getUserOrders
    getUserOrders: builder.query({
      query: () => `/api/user-order`,
      providesTags: ['UserOrders'],
      keepUnusedDataFor: 600,
    }),
    // getUserOrders
    getUserOrderById: builder.query({
      query: id => `/api/user-order/${id}`,
      providesTags: (result, error, arg) => [{ type: 'UserOrder', id: arg }],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
  useGetUserOrderByIdQuery,
  useGetUserOrdersQuery,
  useCheckAddressDiscountMutation,
} = authApi;
