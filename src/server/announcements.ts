const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cacheLife } from 'next/cache';
import { cache } from 'react';

export const getActiveAnnouncements = cache(async () => {
  "use cache";
  cacheLife('hours');
  try {
    const response = await fetch(`${API_BASE_URL}/api/announcement/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
});

