"use cache";

// import { cache } from "react";
import { cacheLife } from "next/cache";
import { API_ENDPOINT } from "./api-endpoint";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PaginatedProductsResponse {
  data: unknown[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** Server-side fetch for initial shop products (SSR). No cache for fresh data. */
export async function getPaginatedProductsServer(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subcategory?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}
): Promise<PaginatedProductsResponse | null> {
  if (!API_BASE_URL?.trim()) return null;

  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const url = `${API_BASE_URL}/api/product/paginated?${searchParams.toString()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const json = await response.json();
    if (!json?.success || !Array.isArray(json?.data)) return null;
    return {
      data: json.data,
      pagination: json.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalProducts: json.data.length,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return null;
  }
}

export async function getProductsShow() {
  // Use "seconds" profile so publish status changes appear within ~1 min
  cacheLife("seconds");
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SHOW}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    if (!data?.result) {
      throw new Error('No products found');
    }
    return data.result;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}


export async function getProductSingle(id: string) {
  // Use "seconds" profile so publish status changes appear within ~1 min
  cacheLife("seconds");
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SINGLE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getRelatedProducts(id: string) {
  // Use "seconds" profile so publish status changes appear within ~1 min
  cacheLife("seconds");
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.PRODUCTS_RELATED}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch related products');
    }
    const data = await response.json();

    // Filter out current product and limit to 8
    const relatedProducts = data?.data?.filter((p: any) => p._id !== id).slice(0, 8) || [];

    return relatedProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}
