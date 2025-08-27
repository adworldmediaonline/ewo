import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Dynamic baseURL configuration to match backend
const getBaseURL = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use the current origin for client-side requests
    return `${window.location.origin}`;
  }

  // Fallback for server-side rendering
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Default fallback
  return 'https://ewo-backend.vercel.app';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: '/api/auth',
  // 🔑 Ensure cookies flow cross-site
  fetchOptions: {
    credentials: 'include',
  },

  plugins: [
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        role: {
          // defaultValue: 'user',
          type: 'string',
          // input: false,
          required: false,
        },
      },
    }),
  ],
});

export type ClientSession = typeof authClient.$Infer.Session;
