import { apiSlice } from '../api/apiSlice';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
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
        console.log('RTK Query query called with filters:', filters);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
        const url = `/api/product/paginated?${params.toString()}`;
        console.log('RTK Query URL:', url);
        return url;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // Create a stable cache key that excludes the page number
        const { page, ...rest } = queryArgs;
        const cacheKey = JSON.stringify(rest);
        console.log('RTK Query cache key:', cacheKey, 'for page:', page);
        return cacheKey;
      },
      merge: (currentCache, newItems, { arg }) => {
        console.log('RTK Query merge called:', {
          currentCacheLength: currentCache?.data?.length || 0,
          newItemsLength: newItems?.data?.length || 0,
          page: arg.page,
          currentCache: currentCache,
          newItems: newItems,
        });

        // If this is the first page, return new items
        if (arg.page === 1) {
          console.log('First page, returning new items');
          return newItems;
        }

        // For subsequent pages, merge with existing data
        if (currentCache && currentCache.data) {
          console.log(
            'Merging pages:',
            currentCache.data.length,
            '+',
            newItems.data.length
          );
          const mergedData = {
            data: [...currentCache.data, ...newItems.data],
            pagination: newItems.pagination,
          };
          console.log('Merged result:', mergedData);
          return mergedData;
        }

        console.log('No current cache, returning new items');
        return newItems;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // Force refetch when filters change (not just page)
        if (!previousArg || !currentArg) return true;
        const { page: currentPage, ...currentFilters } = currentArg;
        const { page: previousPage, ...previousFilters } = previousArg;
        const shouldRefetch = JSON.stringify(currentFilters) !== JSON.stringify(previousFilters);
        console.log('RTK Query forceRefetch:', shouldRefetch, 'current:', currentArg, 'previous:', previousArg);
        return shouldRefetch;
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
