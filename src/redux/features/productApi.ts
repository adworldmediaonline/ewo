import { apiSlice } from '../api/apiSlice';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductsResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getPaginatedProducts: builder.query<
      PaginatedProductsResponse,
      ProductFilters
    >({
      query: filters => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
        return `/api/product/paginated?${params.toString()}`;
      },
      keepUnusedDataFor: 5,
      providesTags: (result, _error, _arg) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({
              type: 'Products' as const,
              id: _id,
            })),
            { type: 'Products', id: 'LIST' },
          ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
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
      query: (id: string) => `/api/product/single-product/${id}`,
      providesTags: (result, _error, id) => [{ type: 'Product', id }],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id: string) => `/api/product/related-product/${id}`,
      providesTags: (result, _error, id) => [{ type: 'RelatedProducts', id }],
    }),
  }),
});

export const {
  useGetPaginatedProductsQuery,
  useLazyGetPaginatedProductsQuery,
  useGetAllProductsQuery,
  useGetOfferProductsQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
} = productApi;
