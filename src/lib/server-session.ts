import { headers } from 'next/headers';
import { cache } from 'react';

export const getServerSession = cache(async () => {
  try {
    const headersList = await headers();
    const cookies = headersList.get('cookie') || '';

    // Get session from your backend's /api/me endpoint
    const baseURL =
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL || 'http://localhost:8090'
        : process.env.NEXT_PUBLIC_BACKEND_URL_PROD ||
          'https://ewo-backend.vercel.app';

    const response = await fetch(`${baseURL}/api/me`, {
      headers: {
        cookie: cookies,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache session data
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Server session error:', error);
    return null;
  }
});
