import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';

// const BACKEND_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.eastwestoffroad.com/';

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
  // baseURL: 'https://ewo-backend.vercel.app',
  baseURL: 'http://localhost:8090',
});

export type ClientSession = typeof authClient.$Infer.Session;
