import { apiSlice } from '../../api/apiSlice';
import { set_client_secret, set_tax_preview } from './orderSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // calculateTax - tax preview for checkout UI
    calculateTax: builder.mutation({
      query: data => ({
        url: '/api/order/calculate-tax',
        method: 'POST',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.success) {
            dispatch(
              set_tax_preview({
                subtotal: result.data.subtotal,
                tax: result.data.tax,
                total: result.data.total,
                calculationId: result.data.calculationId,
                taxCollected: result.data.taxCollected,
              })
            );
          } else {
            dispatch(set_tax_preview(null));
          }
        } catch {
          dispatch(set_tax_preview(null));
        }
      },
    }),
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
        } catch (err) { }
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
      async onQueryStarted(_arg, { queryFulfilled, dispatch: _dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result) {
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
      query: userId => `/api/user-order?userId=${userId}`,
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
  useCalculateTaxMutation,
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
  useGetUserOrderByIdQuery,
  useGetUserOrdersQuery,
} = authApi;
