import { betterFetch } from '@better-fetch/fetch';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { cache } from 'react';

type FullSession = {
  session: Session;
  user: User & { role: string };
};

export const getServerSession = cache(async () => {
  try {
    const { data, error } = await betterFetch<FullSession>(
      '/api/auth/get-session',
      {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090',
        headers: {
          cookie: (await headers()).get('cookie') || '',
        },
        credentials: 'include',
      }
    );

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
});
