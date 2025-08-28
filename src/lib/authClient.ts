import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Get base URL with fallback for different environments
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or fallback
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
  }
  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
};

const baseURL = getBaseURL();

console.log('🔧 Frontend Auth Client Configuration:');
console.log('  - Base URL:', baseURL);
console.log('  - Environment:', process.env.NODE_ENV);

// Create the auth client following official docs
export const authClient = createAuthClient({
  baseURL: baseURL,

  // Configure fetchOptions to handle Bearer tokens and JWT following official docs
  fetchOptions: {
    credentials: 'include',
    onSuccess: ctx => {
      // Store Bearer token from response headers (following official docs)
      const authToken = ctx.response.headers.get('set-auth-token');
      if (authToken) {
        localStorage.setItem('bearer_token', authToken);
      }

      // Store JWT token from response headers (following official docs)
      const jwtToken = ctx.response.headers.get('set-auth-jwt');
      if (jwtToken) {
        localStorage.setItem('jwt_token', jwtToken);
      }
    },
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('bearer_token') || '', // following official docs
    },
  },

  // Add the emailOTPClient plugin as required by official docs
  plugins: [emailOTPClient()],
});

// Export specific methods as recommended in docs
export const { signIn, signUp, useSession } = authClient;
// Token storage utilities for JWT/Bearer support (following official docs)
const TOKEN_KEY = 'bearer_token'; // Use the same key as in fetchOptions
const JWT_KEY = 'jwt_token';

export const tokenStorage = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  getJWT: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(JWT_KEY);
  },
  setJWT: (jwt: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(JWT_KEY, jwt);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(JWT_KEY);
  },
};

// Utility function to get current JWT token
export const getCurrentJWT = () => tokenStorage.getJWT();

// Utility function to make authenticated API calls (following official docs)
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = tokenStorage.getToken();
  const jwt = tokenStorage.getJWT();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add Bearer token if available (following official docs)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add JWT token if available
  if (jwt) {
    headers['X-Better-Auth-JWT'] = jwt;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

// Utility function to get JWT token from server (following official docs)
export const getJWTToken = async () => {
  try {
    const token = tokenStorage.getToken();
    if (!token) {
      throw new Error('No Bearer token available');
    }

    const response = await fetch(`${baseURL}/api/auth/token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get JWT token');
    }

    const data = await response.json();
    if (data.token) {
      tokenStorage.setJWT(data.token);
      return data.token;
    }

    throw new Error('No JWT token in response');
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    throw error;
  }
};

// Utility function to refresh tokens (following official docs)
export const refreshTokens = async () => {
  try {
    const response = await authClient.getSession();
    return response;
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
    tokenStorage.clearTokens();
    throw error;
  }
};
