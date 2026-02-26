'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { toSubcategoryUrlSlug } from '@/lib/shop-url-utils';

import {
  DEFAULT_FILTERS,
  type ShopFiltersState,
} from '../shop-types';

type QuerySetterValue = string | null;

const toQueryValue = (value: string | undefined) => {
  if (value === undefined || value.trim() === '') {
    return null;
  }

  return value;
};

export interface UseShopQueryStateOptions {
  /** Category from path params - used instead of nuqs */
  initialCategory?: string;
  /** Subcategory from path params (backend format, comma-separated for grouped) - used instead of nuqs */
  initialSubcategory?: string;
}

export const useShopQueryState = (options: UseShopQueryStateOptions = {}) => {
  const router = useRouter();
  const { initialCategory = '', initialSubcategory = '' } = options;

  const [queryState, setQueryState] = useQueryStates(
    {
      search: parseAsString.withDefault(DEFAULT_FILTERS.search),
      sortBy: parseAsStringEnum([
        'skuArrangementOrderNo',
        'createdAt',
        'price',
        'title',
      ] as const).withDefault(DEFAULT_FILTERS.sortBy as 'skuArrangementOrderNo'),
      sortOrder: parseAsStringEnum(['asc', 'desc'] as const).withDefault(
        DEFAULT_FILTERS.sortOrder
      ),
    },
    {
      history: 'push',
    }
  );

  const filters: ShopFiltersState = useMemo(
    () => ({
      search: queryState.search,
      category: initialCategory,
      subcategory: initialSubcategory,
      sortBy: queryState.sortBy,
      sortOrder: queryState.sortOrder,
    }),
    [
      queryState.search,
      queryState.sortBy,
      queryState.sortOrder,
      initialCategory,
      initialSubcategory,
    ]
  );

  const setSearch = useCallback(
    async (value: string) => {
      await setQueryState({ search: toQueryValue(value) });
    },
    [setQueryState]
  );

  const setSort = useCallback(
    async (sortBy: string, sortOrder: ShopFiltersState['sortOrder']) => {
      await setQueryState({
        sortBy: toQueryValue(sortBy) as never,
        sortOrder: toQueryValue(sortOrder) as never,
      });
    },
    [setQueryState]
  );

  const toggleCategory = useCallback(
    (category: string) => {
      if (category === initialCategory) return;
      router.push(`/shop/${category}`);
    },
    [initialCategory, router]
  );

  const toggleSubcategory = useCallback(
    (subcategorySlug: string) => {
      if (subcategorySlug === initialSubcategory) return;
      const urlSlug = toSubcategoryUrlSlug(subcategorySlug);
      router.push(`/shop/${initialCategory}/${urlSlug}`);
    },
    [initialCategory, initialSubcategory, router]
  );

  const resetFilters = useCallback(async () => {
    await setQueryState({
      search: null,
      sortBy: null,
      sortOrder: null,
    });
    router.push('/shop');
  }, [setQueryState, router]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== DEFAULT_FILTERS.search ||
      filters.category !== DEFAULT_FILTERS.category ||
      filters.subcategory !== DEFAULT_FILTERS.subcategory ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.sortOrder !== DEFAULT_FILTERS.sortOrder
    );
  }, [filters]);

  const sortKey = useMemo(
    () => `${filters.sortBy}-${filters.sortOrder}`,
    [filters.sortBy, filters.sortOrder]
  );

  return {
    filters,
    setSearch,
    setSort,
    toggleCategory,
    toggleSubcategory,
    resetFilters,
    hasActiveFilters,
    sortKey,
  } as const;
};
