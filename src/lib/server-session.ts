import { betterFetch } from '@better-fetch/fetch';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { cache } from 'react';

type FullSession = {
  session: Session;
  user: User & { role: string };
};

export const getServerSession = cache(async () => {
  const { data } = await betterFetch<FullSession>('/api/auth/get-session', {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090',
    headers: {
      cookie: (await headers()).get('cookie') || '',
    },
  });

  return data;
});
