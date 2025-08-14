'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { add_cart_product } from '@/redux/features/cartSlice';
import { useGetPaginatedProductsQuery } from '@/redux/features/productApi';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { Filter, Grid3X3, List, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import BreadcrumbNav from './breadcrumb';
import ProductCard, { Product } from './product-card';
import ProductSkeleton from './product-skeleton';
import ShopFilters, { ShopFilters as ShopFiltersType } from './shop-filters';

export default function ShopContentWrapper() {
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state: any) => state.cart);
  const { wishlist } = useSelector((state: any) => state.wishlist);

  const [filters, setFilters] = useState<ShopFiltersType>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const currentPageRef = useRef(currentPage);

  const { ref: loadMoreRef, inView } = useInView();

  // Update ref when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const apiFiltersObj = {
      ...filters,
      minPrice: filters.minPrice.toString(),
      maxPrice: filters.maxPrice.toString(),
      page: currentPage,
      limit: 15,
    };
    return apiFiltersObj;
  }, [filters, currentPage]);

  const { data, isLoading, isError, error } = useGetPaginatedProductsQuery(
    apiFilters,
    {
      // Force refetch when page changes
      refetchOnMountOrArgChange: true,
    }
  );

  const products = data?.data || [];
  const pagination = data?.pagination;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load more products when scroll reaches bottom
  useEffect(() => {
    if (inView && pagination?.hasNextPage && !isLoadingMore) {
      const nextPage = currentPageRef.current + 1;
      setCurrentPage(nextPage);
    }
  }, [inView, pagination?.hasNextPage, isLoadingMore]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const handleFiltersChange = useCallback((newFilters: ShopFiltersType) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoadingMore) {
      setIsLoadingMore(true);

      // Increment page and trigger new API call
      const nextPage = currentPageRef.current + 1;
      setCurrentPage(nextPage);

      // Small delay to show loading state
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  }, [pagination?.hasNextPage, isLoadingMore]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      const cartProduct = {
        _id: product._id,
        title: product.title,
        img: product.imageURLs?.[0] || product.img || '',
        price: product.price,
        orderQuantity: 1,
        quantity: product.quantity,
        slug: product.slug,
        shipping: { price: 0 }, // Default shipping price
      };

      dispatch(add_cart_product(cartProduct));
    },
    [dispatch]
  );

  const handleAddToWishlist = useCallback(
    (product: Product) => {
      const wishlistProduct = {
        _id: product._id,
        title: product.title,
        img: product.imageURLs?.[0] || product.img || '',
        price: product.price,
        category: product.category,
        slug: product.slug,
      };

      dispatch(add_to_wishlist(wishlistProduct));
    },
    [dispatch]
  );

  const breadcrumbItems = [{ label: 'Shop', href: '/shop', isCurrent: true }];

  if (filters.category) {
    breadcrumbItems.splice(1, 0, {
      label: filters.category,
      href: `/shop?category=${filters.category}`,
      isCurrent: false,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbItems} />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
              {pagination && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {pagination.totalProducts} products found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Filters Button */}
            <div className="flex items-center gap-2 sm:hidden">
              <Sheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <ShopFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-6">
              <ShopFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isError ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">
                    Error loading products
                  </h3>
                  <p className="text-muted-foreground">
                    Something went wrong. Please try again.
                  </p>
                </div>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms.
                </p>
                <Button onClick={handleClearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div
                  key={`products-page-${currentPage}`}
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {products.map((product: Product, index: number) => (
                    <ProductCard
                      key={`${product._id}-${currentPage}-${index}`}
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onAddToWishlist={() => handleAddToWishlist(product)}
                    />
                  ))}

                  {/* Loading skeletons for initial load */}
                  {isLoading &&
                    currentPage === 1 &&
                    Array.from({ length: 8 }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                </div>

                {/* Load More Section */}
                {pagination?.hasNextPage && (
                  <div ref={loadMoreRef} className="mt-8 text-center">
                    {isLoadingMore ? (
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="text-muted-foreground">
                            Loading more products...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                        >
                          Load More Products
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          Current: {pagination.currentPage} | Total:{' '}
                          {pagination.totalPages} | Products: {products.length}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* End of results */}
                {!pagination?.hasNextPage && products.length > 0 && (
                  <div className="mt-8 text-center text-muted-foreground">
                    <p>You've reached the end of the results.</p>
                  </div>
                )}

                {/* Loading indicator for next page */}
                {isLoadingMore && (
                  <div className="mt-8 flex justify-center">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <ProductSkeleton key={`next-page-${i}`} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
