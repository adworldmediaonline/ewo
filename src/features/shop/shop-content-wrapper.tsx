'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import ShopEmptyState from '@/features/shop/components/shop-empty-state';
import ShopLoadMoreTrigger from '@/features/shop/components/shop-load-more-trigger';
import ShopMobileFilters from '@/features/shop/components/shop-mobile-filters';
import ShopProductGrid from '@/features/shop/components/shop-product-grid';
import ShopSidebar from '@/features/shop/components/shop-sidebar';
import ShopToolbar from '@/features/shop/components/shop-toolbar';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';
import { useShopProducts } from '@/features/shop/hooks/use-shop-products';
import { useShopQueryState } from '@/features/shop/hooks/use-shop-query-state';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';
import { CategoryItem } from '@/lib/server-data';

interface ShopContentWrapperProps {
  categories: CategoryItem[];
}

const ShopContentWrapper = ({ categories }: ShopContentWrapperProps) => {
  const {
    filters,
    setSearch,
    setSort,
    toggleCategory,
    toggleSubcategory,
    resetFilters,
    hasActiveFilters,
    sortKey,
  } = useShopQueryState();

  const {
    products,
    pagination,
    status,
    errorMessage,
    isLoading,
    isLoadingMore,
    fetchNext,
    reset: resetProducts,
    refresh,
    canFetchMore,
  } = useShopProducts(filters);

  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  const activeFiltersCount = useMemo(() => {
    return [
      filters.search.trim() ? 1 : 0,
      filters.category ? 1 : 0,
      filters.subcategory ? 1 : 0,
      filters.sortBy !== DEFAULT_FILTERS.sortBy ? 1 : 0,
      filters.sortOrder !== DEFAULT_FILTERS.sortOrder ? 1 : 0,
    ].filter(Boolean).length;
  }, [filters]);

  const totalProducts = pagination?.totalProducts ?? products.length;

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '400px 0px',
  });

  useEffect(() => {
    if (!inView || !canFetchMore) {
      return;
    }

    fetchNext();
  }, [inView, canFetchMore, fetchNext]);

  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split('-');
      void setSort(sortBy, sortOrder === 'desc' ? 'desc' : 'asc');
    },
    [setSort]
  );

  const handleClearFilters = useCallback(() => {
    resetProducts();
    void resetFilters();
  }, [resetFilters, resetProducts]);

  const showEmptyState =
    !isLoading && products.length === 0 && status !== 'error';

  const showErrorState = status === 'error';

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4">
        <ShopSidebar
          categories={categories}
          activeCategory={filters.category}
          activeSubcategory={filters.subcategory}
          onToggleCategory={toggleCategory}
          onToggleSubcategory={toggleSubcategory}
          onReset={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <section className="flex-1 space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <ShopToolbar
                key={`toolbar-${filters.search}`}
                initialSearch={filters.search}
                onSearchCommit={value => {
                  void setSearch(value);
                }}
                sortKey={sortKey}
                onSortChange={handleSortChange}
                hasActiveFilters={hasActiveFilters}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={handleClearFilters}
                totalProducts={totalProducts}
              />

              <div className="lg:hidden">
                <ShopMobileFilters
                  categories={categories}
                  activeCategory={filters.category}
                  activeSubcategory={filters.subcategory}
                  onToggleCategory={toggleCategory}
                  onToggleSubcategory={toggleSubcategory}
                  onReset={handleClearFilters}
                  activeFiltersCount={activeFiltersCount}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
          </div>

          {showErrorState ? (
            <ShopEmptyState
              variant="error"
              onReset={refresh}
              message={errorMessage}
            />
          ) : showEmptyState ? (
            <ShopEmptyState variant="empty" onReset={handleClearFilters} />
          ) : (
            <>
              <ShopProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />

              <ShopLoadMoreTrigger
                ref={loadMoreRef}
                canFetchMore={canFetchMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={fetchNext}
                hasProducts={products.length > 0}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopContentWrapper;

