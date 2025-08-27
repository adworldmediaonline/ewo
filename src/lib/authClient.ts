import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // baseURL: 'http://localhost:8090',
  baseURL: 'https://ewo-backend.vercel.app',
  // 🔑 Ensure cookies flow cross-site
  fetchOptions: {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
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
