import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8090';

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
  baseURL: BACKEND_URL,
});

export type ClientSession = typeof authClient.$Infer.Session;
