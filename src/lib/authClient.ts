import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // baseURL: 'http://localhost:8090/api/auth',
  baseURL: 'https://ewo-backend.vercel.app/api/auth',
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
