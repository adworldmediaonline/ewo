import { apiSlice } from '../api/apiSlice';

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getAllProducts: builder.query({
      query: () => `/api/product/all`,
      providesTags: ['Products'],
    }),
    getOfferProducts: builder.query({
      query: () => `/api/product/offer`,
      providesTags: ['OfferProducts'],
    }),
    getTopRatedProducts: builder.query({
      query: () => `/api/product/top-rated`,
      providesTags: ['TopRatedProducts'],
    }),
    // get single product
    getProduct: builder.query({
      query: id => `/api/product/single-product/${id}`,
      providesTags: (result, error, arg) => [{ type: 'Product', id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: 'RelatedProducts', id: arg },
      ],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: id => `/api/product/related-product/${id}`,
      providesTags: (result, error, arg) => [
        { type: 'RelatedProducts', id: arg },
      ],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetOfferProductsQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
} = productApi;
