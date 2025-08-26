'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { add_cart_product } from '@/redux/features/cartSlice';
import { useGetPaginatedProductsQuery } from '@/redux/features/productApi';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { Filter, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard, { Product } from './product-card';
import ProductSkeleton from './product-skeleton';
import ShopFilters, { ShopFilters as ShopFiltersType } from './shop-filters';

// Consistent slug generation function - same as homepage
function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Convert slug back to readable category name
// function fromSlug(slug: string): string {
//   if (!slug) return '';
//   return slug
//     .replace(/-/g, ' ')
//     .replace(/\band\b/g, '&')
//     .replace(/\b\w/g, l => l.toUpperCase());
// }

export default function ShopContentWrapper() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart_products: _cart_products } = useSelector(
    (state: any) => state.cart
  );
  const { wishlist: _wishlist } = useSelector((state: any) => state.wishlist);

  // Initialize filters from URL parameters
  const initialCategory = searchParams.get('category') || '';
  const initialSubcategory = searchParams.get('subcategory') || '';

  const [filters, setFilters] = useState<ShopFiltersType>({
    search: '',
    category: initialCategory,
    subcategory: initialSubcategory,
    sortBy: 'skuArrangementOrderNo',
    sortOrder: 'asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const currentPageRef = useRef(currentPage);
  const isUpdatingFromUrl = useRef(false);

  const { ref: loadMoreRef, inView } = useInView();

  // Update ref when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const apiFiltersObj = {
      ...filters,
      page: currentPage,
      limit: 8,
    };
    return apiFiltersObj;
  }, [filters, currentPage]);

  const { data, isLoading, isError } = useGetPaginatedProductsQuery(
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
    filters.subcategory,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Synchronize URL with filters when they change
  useEffect(() => {
    if (isUpdatingFromUrl.current) {
      isUpdatingFromUrl.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams);
    const currentSearch = params.get('search') || '';
    const currentCategory = params.get('category') || '';
    const currentSubcategory = params.get('subcategory') || '';
    const currentSortBy = params.get('sortBy') || 'skuArrangementOrderNo';
    const currentSortOrder = params.get('sortOrder') || 'asc';

    // Only update if there's a mismatch
    if (
      currentSearch !== filters.search ||
      currentCategory !== filters.category ||
      currentSubcategory !== filters.subcategory ||
      currentSortBy !== filters.sortBy ||
      currentSortOrder !== filters.sortOrder
    ) {
      setFilters({
        search: currentSearch,
        category: currentCategory,
        subcategory: currentSubcategory,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder as 'asc' | 'desc',
      });
    }
  }, [
    searchParams,
    filters.search,
    filters.category,
    filters.subcategory,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const handleFiltersChange = useCallback(
    (newFilters: ShopFiltersType) => {
      console.log('handleFiltersChange called with:', newFilters);

      setFilters(newFilters);

      // Set flag to prevent infinite loop in URL sync
      isUpdatingFromUrl.current = true;

      // Update URL parameters when filters change
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.category) {
        const slugifiedCategory = toSlug(newFilters.category);
        console.log('Category conversion:', {
          original: newFilters.category,
          slugified: slugifiedCategory,
        });
        params.set('category', slugifiedCategory);
      }
      if (newFilters.subcategory) {
        const slugifiedSubcategory = toSlug(newFilters.subcategory);
        console.log('Subcategory conversion:', {
          original: newFilters.subcategory,
          slugified: slugifiedSubcategory,
        });
        params.set('subcategory', slugifiedSubcategory);
      }
      if (newFilters.sortBy !== 'skuArrangementOrderNo')
        params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder !== 'asc')
        params.set('sortOrder', newFilters.sortOrder);

      const queryString = params.toString();
      const newUrl = queryString ? `/shop?${queryString}` : '/shop';
      console.log('Generated URL:', newUrl);
      router.push(newUrl);
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      sortBy: 'skuArrangementOrderNo',
      sortOrder: 'asc',
    });
    // Clear URL parameters when filters are cleared
    router.push('/shop');
  }, [router]);

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
        price: product.finalPriceDiscount || product.price || 0,
        orderQuantity: 1,
        quantity: product.quantity,
        slug: product.slug,
        shipping: product.shipping || { price: 0 }, // Use product's actual shipping
        finalPriceDiscount: product.finalPriceDiscount || product.price || 0,
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
        finalPriceDiscount: product.finalPriceDiscount,
        updatedPrice: product.updatedPrice,
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

  if (filters.subcategory) {
    breadcrumbItems.splice(2, 0, {
      label: filters.subcategory,
      href: `/shop?category=${filters.category}&subcategory=${filters.subcategory}`,
      isCurrent: true,
    });
    // Update the category breadcrumb to not be current
    if (breadcrumbItems.length > 1) {
      breadcrumbItems[1].isCurrent = false;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden w-64 flex-shrink-0 lg:block">
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
            {/* Mobile Filters Button */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
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
                  <SheetHeader>
                    <SheetTitle className="text-left">Filters</SheetTitle>
                  </SheetHeader>
                  <ShopFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>

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
                  className={`grid gap-6 ${'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
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
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        className="mx-auto"
                      >
                        Loading More Products
                      </Button>
                    )}
                  </div>
                )}

                {/* End of products indicator */}
                {!pagination?.hasNextPage && products.length > 0 && (
                  <div className="mt-8 text-center text-muted-foreground">
                    <p>You've reached the end of all products.</p>
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
