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
    const timeoutId = setTimeout(() => {
      setPage(1);
      setResult({ data: [], pagination: null });
    }, 0);

    return () => clearTimeout(timeoutId);
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

      setStatus(isInitialPage ? 'loading' : 'loading-more');
      setErrorMessage(null);

      try {
        const result = await fetchProducts(
          toQueryArgs(filtersSnapshot, page)
        ).unwrap();

        if (ignore || !isMountedRef.current) {
          return;
        }

        setResult(prev => ({
          data: isInitialPage ? result.data : [...prev.data, ...result.data],
          pagination: result.pagination,
        }));

        setStatus('success');
      } catch (error) {
        if (ignore || !isMountedRef.current) {
          return;
        }

        setStatus('error');

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
  }, [fetchProducts, filtersSnapshot, page, reloadKey]);

  const fetchNext = useCallback(() => {
    if (status === 'loading' || status === 'loading-more') {
      return;
    }

    if (!pagination?.hasNextPage) {
      return;
    }

    setPage(previous => previous + 1);
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

