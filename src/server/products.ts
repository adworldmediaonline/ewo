"use cache";

// import { cache } from "react";
import { cacheLife } from "next/cache";
import { API_ENDPOINT } from "./api-endpoint";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
