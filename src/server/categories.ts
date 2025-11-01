const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cache } from 'react';
import { API_ENDPOINT } from './api-endpoint';

export const getCategoriesShow = cache(async () => {
  "use cache";
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.CATEGORIES}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    if (!data?.result) {
      throw new Error('No categories found');
    }
    return data?.result || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});
