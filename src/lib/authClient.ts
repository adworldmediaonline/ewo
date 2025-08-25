import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        role: {
          defaultValue: 'user',
          type: 'string',
          input: false,
          required: true,
          // enum: ['super_admin', 'admin', 'user'],
        },
      },
    }),
    nextCookies(),
  ],
  baseURL:
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL
      : process.env.NEXT_PUBLIC_BACKEND_URL_PROD,
  fetchOptions: {
    credentials: 'include',
  },
});

export type ClientSession = typeof authClient.$Infer.Session;
