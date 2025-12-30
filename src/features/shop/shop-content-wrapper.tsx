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
    rootMargin: '200px 0px',
    threshold: 0,
  });

  useEffect(() => {
    if (!inView || !canFetchMore || isLoadingMore) {
      return;
    }

    // Debounce the fetch trigger to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      fetchNext();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [inView, canFetchMore, isLoadingMore, fetchNext]);

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

  // Check if selected category matches the filter image categories
  const shouldShowFilterImage = useMemo(() => {
    const category = filters.category;
    const subcategory = filters.subcategory;

    // Check for steering-knuckles category
    if (category === 'steering-knuckles') {
      return true;
    }

    // Check for crossover-and-high-steer-kits category
    if (category === 'crossover-and-high-steer-kits') {
      // Show image for main category or specific subcategories
      if (!subcategory || subcategory === '10-bolt-kits' || subcategory === 'dana-44') {
        return true;
      }
    }

    return false;
  }, [filters.category, filters.subcategory]);

  return (
    <>
      {/* filter category image show here */}
      {shouldShowFilterImage && (
        <div className="w-full flex items-center justify-center py-2">
          <div className="relative w-full max-w-5xl mx-auto px-4">
            <img
              src="/assets/dana-44-high-steer-vs-stock-steering-comparison-kit.webp"
              alt="Category Filter"
              className="w-full h-auto object-contain rounded shadow-sm"
              style={{ aspectRatio: '1920 / 800' }}
            />
          </div>
        </div>
      )}
      {/* filter image category show here code end */}
      <div className="min-h-screen bg-background py-2 lg:py-6">
        <div className="mx-auto flex w-full max-w-7xl gap-2 lg:gap-4 px-0 md:px-4">
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
            {/* Mobile: Single row with Filters + Toolbar */}
            <div className="flex items-start gap-2 lg:hidden">
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

              <div className="flex-1 min-w-0">
                <ShopToolbar
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
              </div>
            </div>

            {/* Desktop: Toolbar only (sidebar has filters) */}
            <div className="hidden lg:block">
              <ShopToolbar
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
    </>
  );
};

export default ShopContentWrapper;

