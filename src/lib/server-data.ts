import { unstable_cache } from 'next/cache';

// Types for our data
export interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  status?: string;
  products?: unknown[];
  children?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Generic fetch wrapper with error handling
async function fetchFromAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

// Cached categories fetch - this is the key optimization
export const getCategories = unstable_cache(
  async () => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      console.warn(
        'Production build without API URL, returning empty categories'
      );
      return [];
    }

    try {
      console.log('Fetching categories from API...');
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        '/api/category/show'
      );

      // Filter and process categories with safe fallbacks
      const categories = data?.result || [];
      if (!Array.isArray(categories)) {
        console.warn('Categories data is not an array, returning empty array');
        return [];
      }

      const filteredCategories = categories.filter(
        category =>
          category &&
          (category.products?.length ?? 0) > 0 &&
          category.status === 'Show'
      );

      console.log(
        `Fetched ${filteredCategories.length} categories successfully`
      );
      return filteredCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
  ['categories-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['categories'],
  }
);

// Get categories for specific product type
export const getProductTypeCategories = unstable_cache(
  async (type: string) => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return [];
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        `/api/category/show/${type}`
      );
      const categories = data?.result || [];
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error(
        `Error fetching product type categories for ${type}:`,
        error
      );
      return [];
    }
  },
  ['product-type-categories'],
  {
    revalidate: 300,
    tags: ['categories', 'product-types'],
  }
);

// Get all categories (for admin/management)
export const getAllCategories = unstable_cache(
  async () => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return [];
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        '/api/category/all'
      );
      const categories = data?.result || [];
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  },
  ['all-categories'],
  {
    revalidate: 600, // 10 minutes for less critical data
    tags: ['categories', 'admin'],
  }
);

// Get single category by ID
export const getCategoryById = unstable_cache(
  async (id: string) => {
    // Only return null during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return null;
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem }>(
        `/api/category/get/${id}`
      );
      return data.result || null;
    } catch (error) {
      return null;
    }
  },
  ['category-by-id'],
  {
    revalidate: 300,
    tags: ['categories'],
  }
);

// Utility function to convert labels to slugs (moved from components)
export function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Product interfaces
export interface Product {
  _id: string;
  title: string;
  slug: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  finalPriceDiscount?: number;
  updatedPrice?: number;
  category: {
    id: string;
    name: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: any[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductsResponse {
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Cached product fetching - optimized for shop page
export const getPaginatedProducts = unstable_cache(
  async (filters: ProductFilters): Promise<PaginatedProductsResponse> => {
    // Only return empty data during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const data = await fetchFromAPI<{
        success: boolean;
        data: Product[];
        pagination: any;
      }>(`/api/product/paginated?${params.toString()}`);

      return {
        data: data.data || [],
        pagination: data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  },
  ['paginated-products'],
  {
    revalidate: 300, // 5 minutes
    tags: ['products'],
  }
);
