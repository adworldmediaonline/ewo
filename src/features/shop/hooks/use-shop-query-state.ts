'use client';

import { useCallback, useMemo } from 'react';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import {
  DEFAULT_FILTERS,
  SHOP_SORT_FIELDS,
  SHOP_SORT_ORDERS,
  type ShopFiltersState,
} from '../shop-types';

type QuerySetterValue = string | null;

const toQueryValue = (value: string | undefined) => {
  if (value === undefined || value.trim() === '') {
    return null;
  }

  return value;
};

export const useShopQueryState = () => {
  const [filters, setQueryState] = useQueryStates(
    {
      search: parseAsString.withDefault(DEFAULT_FILTERS.search),
      category: parseAsString.withDefault(DEFAULT_FILTERS.category),
      subcategory: parseAsString.withDefault(DEFAULT_FILTERS.subcategory),
      sortBy: parseAsStringEnum([...SHOP_SORT_FIELDS]).withDefault(
        DEFAULT_FILTERS.sortBy
      ),
      sortOrder: parseAsStringEnum([...SHOP_SORT_ORDERS]).withDefault(
        DEFAULT_FILTERS.sortOrder
      ),
    },
    {
      history: 'push',
    }
  );

  const setFilters = useCallback(
    async (updates: Partial<ShopFiltersState>) => {
      const payload = Object.entries(updates).reduce<
        Partial<Record<keyof ShopFiltersState, QuerySetterValue>>
      >((acc, [key, value]) => {
        acc[key as keyof ShopFiltersState] = toQueryValue(
          typeof value === 'string' ? value : value?.toString()
        );
        return acc;
      }, {});

      await setQueryState(payload);
    },
    [setQueryState]
  );

  const setSearch = useCallback(
    (value: string) => {
      return setFilters({ search: value });
    },
    [setFilters]
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder: ShopFiltersState['sortOrder']) => {
      return setFilters({ sortBy, sortOrder });
    },
    [setFilters]
  );

  const toggleCategory = useCallback(
    (category: string) => {
      const nextCategory = category === filters.category ? '' : category;

      return setFilters({
        category: nextCategory,
        subcategory: '',
      });
    },
    [filters.category, setFilters]
  );

  const toggleSubcategory = useCallback(
    (subcategory: string) => {
      const nextSubcategory = subcategory === filters.subcategory ? '' : subcategory;

      return setFilters({ subcategory: nextSubcategory });
    },
    [filters.subcategory, setFilters]
  );

  const resetFilters = useCallback(async () => {
    await setQueryState({
      search: null,
      category: null,
      subcategory: null,
      sortBy: null,
      sortOrder: null,
    });
  }, [setQueryState]);

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
    setFilters,
    setSearch,
    setSort,
    toggleCategory,
    toggleSubcategory,
    resetFilters,
    hasActiveFilters,
    sortKey,
  } as const;
};

