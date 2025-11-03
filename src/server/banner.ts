const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cache } from 'react';
import { API_ENDPOINT } from './api-endpoint';
import { cacheLife } from 'next/cache';

export const getActiveBanners = cache(async () => {
  "use cache";
  cacheLife('days')
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.BANNER}`);
    if (!response.ok) {
      throw new Error('Failed to fetch banner');
    }
    const data = await response.json();
    if (!data?.data) {
      throw new Error('No banner found');
    }
    //
    return data?.data || [];
  } catch (error) {
    console.error('Error fetching banner:', error);
    return [];
  }
});
