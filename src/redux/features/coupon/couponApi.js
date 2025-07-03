import { apiSlice } from '@/redux/api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get offer coupon
    getOfferCoupons: builder.query({
      query: () => `api/coupon`,
      providesTags: ['Coupon'],
      keepUnusedDataFor: 600,
    }),

    // validate coupon - Enhanced coupon validation
    validateCoupon: builder.mutation({
      query: data => ({
        url: 'api/coupon/validate',
        method: 'POST',
        body: data,
      }),
    }),

    // get valid coupons for user
    getValidCoupons: builder.query({
      query: userId => {
        const params = userId ? `?userId=${userId}` : '';
        return `api/coupon/valid/list${params}`;
      },
      providesTags: ['Coupon'],
      keepUnusedDataFor: 300,
    }),

    // get all coupons
    getAllActiveCoupons: builder.query({
      query: () => 'api/coupon/list-all',
      providesTags: ['Coupon'],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetOfferCouponsQuery,
  useValidateCouponMutation,
  useGetValidCouponsQuery,
  useGetAllActiveCouponsQuery,
} = authApi;
