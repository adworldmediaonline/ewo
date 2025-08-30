import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCurrentJWT, tokenStorage } from '../../lib/authClient';

// Get base URL with fallback for different environments
const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
};

const baseURL = getBaseURL();

// Enhanced baseQuery with Better Auth support (following official docs)
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: baseURL,
  prepareHeaders: async (headers, { getState, endpoint }) => {
    // Add content type
    headers.set('Content-Type', 'application/json');

    try {
      // First try to get Bearer token from storage (following official docs)
      const bearerToken = tokenStorage.getToken();
      if (bearerToken) {
        headers.set('Authorization', `Bearer ${bearerToken}`);
      }

      // Also add JWT token if available
      const jwtToken = getCurrentJWT();
      if (jwtToken) {
        headers.set('X-Better-Auth-JWT', jwtToken);
      }

      // Fallback: Check if we have a legacy access token in Redux state
      const state = getState();
      if (state.auth?.accessToken && !bearerToken) {
        headers.set('Authorization', `Bearer ${state.auth.accessToken}`);
      }
    } catch (error) {
      console.warn('Failed to prepare auth headers:', error);
    }

    return headers;
  },
  credentials: 'include', // Include cookies for Better Auth
});

// Enhanced baseQuery with retry logic and error handling
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // If we get a 401, try to refresh tokens
  if (result.error && result.error.status === 401) {
    try {
      // Try to refresh the session using Better Auth
      const refreshResult = await baseQueryWithAuth(
        '/api/auth/session',
        api,
        extraOptions
      );
      if (refreshResult.data) {
        // Retry the original request
        result = await baseQueryWithAuth(args, api, extraOptions);
      }
    } catch (refreshError) {
      console.warn('Token refresh failed:', refreshError);
      // Clear tokens and redirect to login
      tokenStorage.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
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
    'User', // Add user tag for profile updates
    'Auth', // Add auth tag for authentication state
  ],
});

// Export the enhanced baseQuery for use in other parts of the app
export { baseQueryWithAuth, baseQueryWithRetry };
