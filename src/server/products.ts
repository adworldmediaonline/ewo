import { cache } from "react";
import { API_ENDPOINT } from "./api-endpoint";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getProductsShow = cache(async () => {
  "use cache";
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
});


export const getProductSingle = cache(async (id: string) => {
  "use cache";
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
});
