import { getCurrentJWT, tokenStorage } from './authClient';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

// Utility function to get authentication headers
export const getAuthHeaders = (
  additionalHeaders: Record<string, string> = {}
) => {
  const token = tokenStorage.getToken();
  const jwt = getCurrentJWT();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  // Add Bearer token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add JWT token if available
  if (jwt) {
    headers['X-Better-Auth-JWT'] = jwt;
  }

  return headers;
};

// Utility function to make authenticated API calls
export const authenticatedApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(options.headers as Record<string, string>);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API call failed: ${response.status}`);
  }

  return response.json();
};

// Specific API functions
export const api = {
  // User profile
  getProfile: () => authenticatedApiCall('/api/me'),

  // Update profile
  updateProfile: (data: any) =>
    authenticatedApiCall('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Get orders
  getOrders: () => authenticatedApiCall('/api/user-order'),

  // Get order by ID
  getOrder: (orderId: string) =>
    authenticatedApiCall(`/api/user-order/${orderId}`),

  // Get cart
  getCart: () => authenticatedApiCall('/api/cart'),

  // Add to cart
  addToCart: (data: any) =>
    authenticatedApiCall('/api/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update cart item
  updateCartItem: (itemId: string, data: any) =>
    authenticatedApiCall(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Remove from cart
  removeFromCart: (itemId: string) =>
    authenticatedApiCall(`/api/cart/${itemId}`, {
      method: 'DELETE',
    }),

  // Get wishlist
  getWishlist: () => authenticatedApiCall('/api/user/wishlist'),

  // Add to wishlist
  addToWishlist: (productId: string) =>
    authenticatedApiCall('/api/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // Remove from wishlist
  removeFromWishlist: (productId: string) =>
    authenticatedApiCall(`/api/user/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  // Get reviews
  getReviews: () => authenticatedApiCall('/api/review'),

  // Create review
  createReview: (data: any) =>
    authenticatedApiCall('/api/review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update review
  updateReview: (reviewId: string, data: any) =>
    authenticatedApiCall(`/api/review/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete review
  deleteReview: (reviewId: string) =>
    authenticatedApiCall(`/api/review/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Error handling utility
export const handleApiError = (error: any) => {
  if (error.message?.includes('401')) {
    // Unauthorized - redirect to login
    window.location.href = '/sign-in';
    return;
  }

  if (error.message?.includes('403')) {
    // Forbidden - show access denied message
    console.error('Access denied:', error);
    return;
  }

  // Log other errors
  console.error('API Error:', error);
  throw error;
};

// Retry utility for failed requests
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};
