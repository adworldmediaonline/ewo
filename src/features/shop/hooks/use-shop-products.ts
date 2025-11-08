'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  SHOP_PAGE_SIZE,
  type ShopFiltersState,
  type ShopPagination,
  type ShopProduct,
  type ShopQueryArgs,
} from '../shop-types';

import { useLazyGetPaginatedProductsQuery } from '@/redux/features/productApi';

type Status = 'idle' | 'loading' | 'loading-more' | 'success' | 'error';

const toQueryArgs = (filters: ShopFiltersState, page: number): ShopQueryArgs => ({
  ...filters,
  page,
  limit: SHOP_PAGE_SIZE,
});

export const useShopProducts = (filters: ShopFiltersState) => {
  const [{ data: items, pagination }, setResult] = useState<{
    data: ShopProduct[];
    pagination: ShopPagination | null;
  }>({ data: [], pagination: null });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const isMountedRef = useRef(true);
  const pendingResetRef = useRef(false);
  const currentFetchRef = useRef<string | null>(null);

  const [fetchProducts] = useLazyGetPaginatedProductsQuery();

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search,
        category: filters.category,
        subcategory: filters.subcategory,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
    [filters]
  );

  const filtersSnapshot = useMemo(() => ({ ...filters }), [filters]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    pendingResetRef.current = true;
    currentFetchRef.current = null;
    setPage(1);
    setResult({ data: [], pagination: null });
  }, [filtersKey]);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      const isInitialPage = page === 1;

      if (pendingResetRef.current) {
        if (!isInitialPage) {
          return;
        }

        pendingResetRef.current = false;
      }

      // Prevent duplicate fetches for the same filter/page combination
      const fetchKey = `${filtersKey}-${page}`;
      if (currentFetchRef.current === fetchKey) {
        return;
      }

      currentFetchRef.current = fetchKey;

      setStatus(isInitialPage ? 'loading' : 'loading-more');
      setErrorMessage(null);

      try {
        const result = await fetchProducts(
          toQueryArgs(filtersSnapshot, page)
        ).unwrap();

        if (ignore || !isMountedRef.current) {
          return;
        }

        setResult(prev => {
          if (isInitialPage) {
            return {
              data: result.data,
              pagination: result.pagination,
            };
          }

          // Deduplicate products by _id to prevent duplicates
          const existingIds = new Set(prev.data.map(p => p._id));
          const newProducts = result.data.filter(p => !existingIds.has(p._id));

          return {
            data: [...prev.data, ...newProducts],
            pagination: result.pagination,
          };
        });

        setStatus('success');
        // Clear fetch ref after successful load to allow next fetch
        currentFetchRef.current = null;
      } catch (error) {
        if (ignore || !isMountedRef.current) {
          return;
        }

        setStatus('error');
        // Clear fetch ref on error to allow retry
        currentFetchRef.current = null;

        const message =
          typeof error === 'object' && error && 'data' in error
            ? // @ts-expect-error - RTK Query error typing
            error.data?.message ?? 'Failed to load products.'
            : 'Failed to load products.';

        setErrorMessage(message);
      }
    };

    void loadProducts();

    return () => {
      ignore = true;
    };
  }, [fetchProducts, filtersSnapshot, page, reloadKey, filtersKey]);

  const fetchNext = useCallback(() => {
    // Prevent multiple calls while already loading
    if (status === 'loading' || status === 'loading-more') {
      return;
    }

    // Check if there are more pages
    if (!pagination?.hasNextPage) {
      return;
    }

    // Increment page to trigger fetch
    setPage(prev => prev + 1);
  }, [pagination?.hasNextPage, status]);

  const reset = useCallback(() => {
    pendingResetRef.current = true;
    setPage(1);
    setResult({ data: [], pagination: null });
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const refresh = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setReloadKey(previous => previous + 1);
  }, []);

  return {
    products: items,
    pagination,
    status,
    errorMessage,
    isLoading: status === 'loading',
    isLoadingMore: status === 'loading-more',
    fetchNext,
    reset,
    refresh,
    canFetchMore: Boolean(pagination?.hasNextPage),
  } as const;
};

