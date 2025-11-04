const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cache } from 'react';
import { API_ENDPOINT } from './api-endpoint';
import { cacheLife } from 'next/cache';

export const getActiveBanners = cache(async () => {
  "use cache";
  cacheLife('days')
  try {
    // Add timeout to prevent long delays
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.BANNER}`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'Cache-Control': 'max-age=86400',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to fetch banner');
    }
    const data = await response.json();
    if (!data?.data) {
      throw new Error('No banner found');
    }

    return data?.data || [];
  } catch (error) {
    console.error('Error fetching banner:', error);
    return [];
  }
});
