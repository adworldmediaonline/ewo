import { apiSlice } from '../api/apiSlice';

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    addCategory: builder.mutation({
      query: data => ({
        url: '/api/category/add',
        method: 'POST',
        body: data,
      }),
    }),
    getShowCategory: builder.query({
      query: () => `/api/category/show`,
    }),
    getProductTypeCategory: builder.query({
      query: type => `/api/category/show/${type}`,
    }),
    getAllCategories: builder.query({
      query: () => `/api/category/all`,
    }),
    getCategoryById: builder.query({
      query: id => `/api/category/get/${id}`,
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetProductTypeCategoryQuery,
  useGetShowCategoryQuery,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoryApi;
