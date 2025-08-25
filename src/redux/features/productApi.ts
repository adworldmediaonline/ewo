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
      serializeQueryArgs: ({ queryArgs }) => {
        // Create a stable cache key that excludes the page number
        const { page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, newItems, { arg }) => {
        // If this is the first page, return new items
        if (arg.page === 1) {
          return newItems;
        }

        // For subsequent pages, merge with existing data
        if (currentCache && currentCache.data) {
          return {
            data: [...currentCache.data, ...newItems.data],
            pagination: newItems.pagination,
          };
        }

        return newItems;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // Force refetch when filters change (not just page)
        if (!previousArg || !currentArg) return true;
        const { page: currentPage, ...currentFilters } = currentArg;
        const { page: previousPage, ...previousFilters } = previousArg;
        return (
          JSON.stringify(currentFilters) !== JSON.stringify(previousFilters)
        );
      },
      // Add a key to ensure re-fetching when page changes
      keepUnusedDataFor: 0,
      providesTags: (result, error, arg) =>
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
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id: string) => `/api/product/related-product/${id}`,
      providesTags: (result, error, id) => [{ type: 'RelatedProducts', id }],
    }),
  }),
});

export const {
  useGetPaginatedProductsQuery,
  useGetAllProductsQuery,
  useGetOfferProductsQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
} = productApi;
