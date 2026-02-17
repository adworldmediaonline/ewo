import type { Product as ProductCardProduct } from '@/components/version-tsx/product-card';

export const SHOP_PAGE_SIZE = 12;

export type SortDirection = 'asc' | 'desc';

export interface ShopFiltersState {
  search: string;
  category: string;
  subcategory: string;
  sortBy: string;
  sortOrder: SortDirection;
}

export interface ShopQueryArgs extends ShopFiltersState {
  page?: number;
  limit?: number;
}

export interface ShopPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ShopProduct = ProductCardProduct;

export interface ShopProductsResult {
  data: ShopProduct[];
  pagination: ShopPagination;
}

export const DEFAULT_FILTERS: ShopFiltersState = {
  search: '',
  category: '',
  subcategory: '',
  sortBy: 'skuArrangementOrderNo',
  sortOrder: 'asc',
};

export const SHOP_SORT_FIELDS = [
  'skuArrangementOrderNo',
  'createdAt',
  'price',
  'title',
] as const;

export const SHOP_SORT_ORDERS: SortDirection[] = ['asc', 'desc'];

export const SHOP_SORT_OPTIONS = [
  { value: 'skuArrangementOrderNo-asc', label: 'Default Order' },
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
] as const;

