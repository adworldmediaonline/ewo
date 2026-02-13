'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

import { cn } from '@/lib/utils';

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
import {
  CategoryItem,
  toSlug,
  type BannerDisplayScope,
} from '@/lib/server-data';

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

  // Resolve category banner - image scope and content scope work independently
  const categoryBannerContext = useMemo(() => {
    const categorySlug = filters.category;
    const subcategorySlug = filters.subcategory;

    if (!categorySlug || !categories.length) {
      return null;
    }

    const category = categories.find(
      (c) => toSlug(c.parent) === categorySlug
    );
    if (!category) return null;

    const isParentView = !subcategorySlug || subcategorySlug === '';

    // Banner IMAGE scope - independent
    const imageScope: BannerDisplayScope =
      category.bannerDisplayScope || 'all';
    const imageDisplayChildren = category.bannerDisplayChildren || [];
    const isImageChildInScope =
      subcategorySlug && imageDisplayChildren.includes(subcategorySlug);

    let showBannerImage = false;
    if (category.banner?.url) {
      switch (imageScope) {
        case 'all':
          showBannerImage = true;
          break;
        case 'parent_only':
          showBannerImage = isParentView;
          break;
        case 'children_only':
          showBannerImage = !!isImageChildInScope;
          break;
        case 'parent_and_children':
          showBannerImage = isParentView || !!isImageChildInScope;
          break;
        default:
          showBannerImage = true;
      }
    }

    // Banner CONTENT scope - independent
    const contentScope: BannerDisplayScope =
      category.bannerContentDisplayScope || 'all';
    const contentDisplayChildren = category.bannerContentDisplayChildren || [];
    const isContentChildInScope =
      subcategorySlug && contentDisplayChildren.includes(subcategorySlug);

    let showBannerContent = false;
    if (category.bannerContentActive) {
      switch (contentScope) {
        case 'all':
          showBannerContent = true;
          break;
        case 'parent_only':
          showBannerContent = isParentView;
          break;
        case 'children_only':
          showBannerContent = !!isContentChildInScope;
          break;
        case 'parent_and_children':
          showBannerContent = isParentView || !!isContentChildInScope;
          break;
        default:
          showBannerContent = true;
      }
    }

    // Render only when at least one is visible
    if (!showBannerImage && !showBannerContent) return null;

    // Dynamic banner title: category name + product count (separate for styling)
    const productCount = totalProducts;
    const productLabel = productCount === 1 ? 'product' : 'products';
    const productCountText = ` (${productCount} ${productLabel})`;
    const categoryName = isParentView
      ? category.parent
      : (category.children?.find(
          (c) => toSlug(c) === subcategorySlug
        ) || subcategorySlug);

    // Resolve per-scope classes and options: parent vs child, with fallbacks
    const defaultTitleClasses = 'text-center';
    const defaultDescClasses = 'text-center';
    const legacyTitleClasses =
      category.bannerTitleClasses?.trim() || defaultTitleClasses;
    const legacyDescClasses =
      category.bannerDescriptionClasses?.trim() || defaultDescClasses;

    const scopeClasses = category.bannerContentClassesByScope;
    const parentScope = scopeClasses?.parent;
    const childrenScope = scopeClasses?.children ?? {};

    let bannerTitleClasses: string;
    let bannerDescriptionClasses: string;
    let bannerHeadingTag: 'h1' | 'h2' | 'h3';
    let bannerProductCountClasses: string;

    if (isParentView) {
      bannerTitleClasses =
        parentScope?.titleClasses?.trim() || legacyTitleClasses;
      bannerDescriptionClasses =
        parentScope?.descriptionClasses?.trim() || legacyDescClasses;
      bannerHeadingTag =
        parentScope?.headingTag || 'h2';
      bannerProductCountClasses =
        parentScope?.productCountClasses?.trim() || '';
    } else {
      const childScope = subcategorySlug
        ? childrenScope[subcategorySlug]
        : undefined;
      bannerTitleClasses =
        childScope?.titleClasses?.trim() ||
        parentScope?.titleClasses?.trim() ||
        legacyTitleClasses;
      bannerDescriptionClasses =
        childScope?.descriptionClasses?.trim() ||
        parentScope?.descriptionClasses?.trim() ||
        legacyDescClasses;
      bannerHeadingTag =
        childScope?.headingTag ||
        parentScope?.headingTag ||
        'h2';
      bannerProductCountClasses =
        childScope?.productCountClasses?.trim() ||
        parentScope?.productCountClasses?.trim() ||
        '';
    }

    return {
      banner: category.banner,
      showBannerImage,
      showBannerContent,
      bannerCategoryName: showBannerContent ? categoryName : '',
      bannerProductCountText: showBannerContent ? productCountText : '',
      bannerDescription: category.bannerDescription || '',
      bannerTitleClasses: bannerTitleClasses || defaultTitleClasses,
      bannerDescriptionClasses:
        bannerDescriptionClasses || defaultDescClasses,
      bannerHeadingTag,
      bannerProductCountClasses,
    };
  }, [
    filters.category,
    filters.subcategory,
    categories,
    totalProducts,
  ]);

  return (
    <>
      {/* Category banner - image and content scopes work independently */}
      {categoryBannerContext && (
        <div className="w-full flex flex-col items-center justify-center space-y-0">
          {categoryBannerContext.showBannerContent &&
            categoryBannerContext.bannerCategoryName && (
            <div className="w-full max-w-7xl mx-auto px-4 py-4">
              {(() => {
                const HeadingTag =
                  categoryBannerContext.bannerHeadingTag;
                return (
                  <HeadingTag
                    className={cn(
                      'text-xl sm:text-2xl md:text-3xl font-bold text-foreground',
                      categoryBannerContext.bannerTitleClasses
                    )}
                  >
                    {categoryBannerContext.bannerCategoryName}
                    {categoryBannerContext.bannerProductCountText && (
                      <span
                        className={cn(
                          'ml-1',
                          categoryBannerContext.bannerProductCountClasses
                        )}
                      >
                        {categoryBannerContext.bannerProductCountText}
                      </span>
                    )}
                  </HeadingTag>
                );
              })()}
            </div>
          )}
          {categoryBannerContext.showBannerImage && categoryBannerContext.banner?.url && (
            <div className="w-full flex items-center justify-center">
              <div className="relative w-full mx-auto">
                <Image
                  src={`/api/image?url=${encodeURIComponent(categoryBannerContext.banner.url)}&filename=${encodeURIComponent(categoryBannerContext.banner.fileName || 'category-banner.webp')}`}
                  alt={categoryBannerContext.banner.altText || categoryBannerContext.banner.title || 'Category banner'}
                  title={categoryBannerContext.banner.title}
                  width={1920}
                  height={800}
                  className="w-full h-auto object-contain"
                  style={{ aspectRatio: '1920 / 800' }}
                  sizes="100vw"
                  unoptimized
                  priority={false}
                />
              </div>
            </div>
          )}
          {categoryBannerContext.showBannerContent &&
            categoryBannerContext.bannerDescription && (
              <div className="w-full max-w-7xl mx-auto px-4 py-4">
                <p
                  className={cn(
                    'text-sm sm:text-base text-muted-foreground leading-relaxed',
                    categoryBannerContext.bannerDescriptionClasses
                  )}
                >
                  {categoryBannerContext.bannerDescription}
                </p>
              </div>
            )}
        </div>
      )}
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

