'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryItem } from '@/lib/server-data';
import { add_cart_product } from '@/redux/features/cartSlice';
import { useGetPaginatedProductsQuery } from '@/redux/features/productApi';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { notifyError, notifySuccess } from '@/utils/toast';
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

interface ShopContentWrapperProps {
  categories: CategoryItem[];
}

export default function ShopContentWrapper({
  categories,
}: ShopContentWrapperProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart_products } = useSelector((state: any) => state.cart);
  const { wishlist: _wishlist } = useSelector((state: any) => state.wishlist);

  // Initialize filters from URL parameters
  const initialCategory = searchParams.get('category') || '';
  const initialSubcategory = searchParams.get('subcategory') || '';

  const [filters, setFilters] = useState<ShopFiltersType>({
    search: '',
    category: initialCategory,
    subcategory: initialSubcategory, // Restore subcategory support
    sortBy: 'skuArrangementOrderNo',
    sortOrder: 'asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [pendingFilters, setPendingFilters] = useState<ShopFiltersType | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentPageRef = useRef(currentPage);
  const isUpdatingFromUrl = useRef(false);
  const isFilterChanging = useRef(false); // New ref to track filter changes

  const { ref: loadMoreRef, inView } = useInView();

  const sortOptions = [
    { value: 'skuArrangementOrderNo-asc', label: 'Default Order' },
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'title-asc', label: 'Name: A to Z' },
    { value: 'title-desc', label: 'Name: Z to A' },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.subcategory ||
    filters.sortBy ||
    filters.sortOrder;

  // Mobile dropdown handlers
  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) {
      // Initialize pending filters with current filters when opening
      setPendingFilters({ ...filters });
      setLocalSearch(filters.search);
    } else {
      // Reset pending filters when closing without applying
      setPendingFilters(null);
      setLocalSearch(filters.search);
    }
  };

  const handleMobileSearchChange = (value: string) => {
    setLocalSearch(value);
    if (pendingFilters) {
      setPendingFilters(prev => ({
        ...prev!,
        search: value,
      }));
    }
  };

  const handleMobileSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    if (pendingFilters) {
      setPendingFilters(prev => ({
        ...prev!,
        sortBy: field,
        sortOrder: order as 'asc' | 'desc',
      }));
    }
  };

  const handleMobileCategoryChange = (categorySlug: string) => {
    if (pendingFilters) {
      const newCategory =
        pendingFilters.category === categorySlug ? '' : categorySlug;
      setPendingFilters(prev => ({
        ...prev!,
        category: newCategory,
        // Clear subcategory when selecting a new category
        subcategory: newCategory ? '' : prev!.subcategory,
      }));
    }
  };

  const handleApplyFilters = () => {
    if (pendingFilters) {
      // Update localSearch to match the applied search
      setLocalSearch(pendingFilters.search);
      handleFiltersChange(pendingFilters);
      setPendingFilters(null);
      setIsDropdownOpen(false);
    }
  };

  const handleCancelFilters = () => {
    setPendingFilters(null);
    setLocalSearch(filters.search);
    setIsDropdownOpen(false);
  };

  const getDisplayFilters = () => {
    return pendingFilters || filters;
  };

  const hasPendingChanges = () => {
    if (!pendingFilters) return false;
    return (
      pendingFilters.search !== filters.search ||
      pendingFilters.category !== filters.category ||
      pendingFilters.subcategory !== filters.subcategory ||
      pendingFilters.sortBy !== filters.sortBy ||
      pendingFilters.sortOrder !== filters.sortOrder
    );
  };

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
    const hasChanges =
      currentSearch !== filters.search ||
      currentCategory !== filters.category ||
      currentSubcategory !== filters.subcategory ||
      currentSortBy !== filters.sortBy ||
      currentSortOrder !== filters.sortOrder;

    if (hasChanges) {
      // Set flag to prevent race conditions
      isFilterChanging.current = true;

      setFilters({
        search: currentSearch,
        category: currentCategory,
        subcategory: currentSubcategory, // Restore subcategory support
        sortBy: currentSortBy,
        sortOrder: currentSortOrder as 'asc' | 'desc',
      });

      // Update local search state to match URL
      setLocalSearch(currentSearch);
    }
  }, [searchParams]); // Only depend on searchParams to avoid infinite loops

  const handleFiltersChange = useCallback(
    (newFilters: ShopFiltersType) => {
      // IMPORTANT: Clear subcategory when only parent category is selected
      // This ensures that clicking on a parent category in sidebar clears any previous subcategory
      const updatedFilters = { ...newFilters };
      if (updatedFilters.category && !updatedFilters.subcategory) {
        updatedFilters.subcategory = '';
      }

      setFilters(updatedFilters);

      // Set flag to prevent infinite loop in URL sync
      isUpdatingFromUrl.current = true;

      // Update URL parameters when filters change
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.category) {
        // Check if category is already a slug (contains hyphens and no spaces)
        const isAlreadySlug =
          newFilters.category.includes('-') &&
          !newFilters.category.includes(' ');
        const categoryParam = isAlreadySlug
          ? newFilters.category
          : toSlug(newFilters.category);
        params.set('category', categoryParam);

        // IMPORTANT: Clear subcategory when only parent category is selected
        // This ensures that clicking on a parent category in sidebar clears any previous subcategory
        if (!newFilters.subcategory) {
          // Explicitly remove subcategory from URL when only parent category is selected
          params.delete('subcategory');
        }
      }
      if (newFilters.subcategory) {
        const isAlreadySlug =
          newFilters.subcategory.includes('-') &&
          !newFilters.subcategory.includes(' ');
        const subcategoryParam = isAlreadySlug
          ? newFilters.subcategory
          : toSlug(newFilters.subcategory);
        params.set('subcategory', subcategoryParam);
      }
      if (newFilters.sortBy !== 'skuArrangementOrderNo')
        params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder !== 'asc')
        params.set('sortOrder', newFilters.sortOrder);

      const queryString = params.toString();
      const newUrl = queryString ? `/shop?${queryString}` : '/shop';

      router.push(newUrl);
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      subcategory: '', // Keep empty for consistency
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
    (product: Product, selectedOption?: any) => {
      // Check if product has options but none are selected
      if (product.options && product.options.length > 0 && !selectedOption) {
        notifyError(
          'Please select an option before adding the product to your cart.'
        );
        return;
      }

      // Check if product already exists in cart
      const existingProduct = cart_products.find(
        (item: any) => item._id === product._id
      );

      // If product exists, check if option has changed
      const optionChanged =
        existingProduct &&
        JSON.stringify(existingProduct.selectedOption) !==
          JSON.stringify(selectedOption);

      // Get current quantity from existing product
      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;

      // Determine final quantity based on whether option changed
      const finalQuantity = optionChanged ? currentQty : currentQty + 1;

      // If product has quantity limitation and requested quantity exceeds available
      if (product.quantity && finalQuantity > product.quantity) {
        notifyError(
          `Sorry, only ${product.quantity} items available. ${
            existingProduct
              ? `You already have ${currentQty} in your cart.`
              : ''
          }`
        );
        return;
      }

      const cartProduct = {
        _id: product._id,
        title: product.title,
        img: product.imageURLs?.[0] || product.img || '',
        price: product.finalPriceDiscount || product.price || 0,
        orderQuantity: 1,
        quantity: product.quantity,
        slug: product.slug,
        shipping: product.shipping || { price: 0 },
        finalPriceDiscount: product.finalPriceDiscount || product.price || 0,
        sku: product.sku,
        options: selectedOption,
        // If an option is selected, update the final price to include the option price
        finalPrice: selectedOption
          ? (
              Number(product.finalPriceDiscount || product.price) +
              Number(selectedOption.price)
            ).toFixed(2)
          : undefined,
      };

      dispatch(add_cart_product(cartProduct));

      // Show success message
      if (optionChanged) {
        notifySuccess(`Option updated to "${selectedOption?.title}"`);
      } else {
        notifySuccess(`${product.title} added to cart`);
      }
    },
    [dispatch, cart_products]
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
        sku: product.sku,
        finalPriceDiscount: product.finalPriceDiscount,
        updatedPrice: product.updatedPrice,
      };

      dispatch(add_to_wishlist(wishlistProduct));
      notifySuccess(`${product.title} added to wishlist`);
    },
    [dispatch]
  );

  const breadcrumbItems = [
    { label: 'Shop', href: '/shop', isCurrent: !filters.category },
  ];

  if (filters.category) {
    breadcrumbItems.splice(1, 0, {
      label: filters.category,
      href: `/shop?category=${filters.category}`,
      isCurrent: !filters.subcategory,
    });
    // Update the shop breadcrumb to not be current when category is selected
    breadcrumbItems[0].isCurrent = false;
  }

  if (filters.subcategory) {
    breadcrumbItems.splice(2, 0, {
      label: filters.subcategory,
      href: `/shop?category=${filters.category}&subcategory=${filters.subcategory}`,
      isCurrent: true,
    });
    // Update the category breadcrumb to not be current when subcategory is selected
    if (breadcrumbItems[1]) {
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
                categories={categories}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filters Dropdown */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={handleDropdownOpenChange}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {
                          [
                            filters.search,
                            filters.category,
                            filters.sortBy !== 'skuArrangementOrderNo'
                              ? filters.sortBy
                              : '',
                            filters.sortOrder !== 'asc'
                              ? filters.sortOrder
                              : '',
                          ].filter(Boolean).length
                        }
                      </Badge>
                    )}
                    {hasPendingChanges() && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-4">
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-search"
                        className="text-sm font-medium"
                      >
                        Search Products
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="mobile-search"
                          placeholder="Search products..."
                          value={getDisplayFilters().search}
                          onChange={e =>
                            handleMobileSearchChange(e.target.value)
                          }
                          className="flex-1 h-9"
                        />
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Sort */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sort By</Label>
                      <Select
                        onValueChange={handleMobileSortChange}
                        value={`${getDisplayFilters().sortBy}-${
                          getDisplayFilters().sortOrder
                        }`}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select sort option" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Categories */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Categories</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {categories?.map((cat: CategoryItem) => {
                          const categorySlug = toSlug(cat.parent);
                          const isSelected =
                            getDisplayFilters().category === categorySlug;

                          return (
                            <div key={cat._id} className="space-y-1">
                              <Button
                                variant={isSelected ? 'default' : 'ghost'}
                                size="sm"
                                className="w-full justify-between h-8 text-sm"
                                onClick={() =>
                                  handleMobileCategoryChange(categorySlug)
                                }
                              >
                                <span className="truncate">{cat.parent}</span>
                                {cat.products?.length &&
                                  cat.products.length > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs ml-1"
                                    >
                                      {cat.products.length}
                                    </Badge>
                                  )}
                              </Button>

                              {/* Subcategories */}
                              {isSelected &&
                                cat.children &&
                                cat.children.length > 0 && (
                                  <div className="ml-4 space-y-1">
                                    {cat.children.map((child: string) => {
                                      const childSlug = toSlug(child);
                                      const isChildSelected =
                                        getDisplayFilters().subcategory ===
                                        childSlug;

                                      return (
                                        <Button
                                          key={child}
                                          variant={
                                            isChildSelected
                                              ? 'default'
                                              : 'ghost'
                                          }
                                          size="sm"
                                          className="w-full justify-between h-6 text-xs"
                                          onClick={() => {
                                            if (pendingFilters) {
                                              const newSubcategory =
                                                isChildSelected
                                                  ? ''
                                                  : childSlug;
                                              setPendingFilters(prev => ({
                                                ...prev!,
                                                subcategory: newSubcategory,
                                              }));
                                            }
                                          }}
                                        >
                                          <span className="truncate">
                                            {child}
                                          </span>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleCancelFilters}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={handleApplyFilters}
                        disabled={!hasPendingChanges()}
                      >
                        Apply Filters
                        {hasPendingChanges() && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {
                              [
                                pendingFilters!.search !== filters.search
                                  ? 'search'
                                  : '',
                                pendingFilters!.category !== filters.category
                                  ? 'category'
                                  : '',
                                pendingFilters!.sortBy !== filters.sortBy ||
                                pendingFilters!.sortOrder !== filters.sortOrder
                                  ? 'sort'
                                  : '',
                              ].filter(Boolean).length
                            }
                          </Badge>
                        )}
                      </Button>
                    </div>

                    {hasActiveFilters && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-destructive"
                          onClick={handleClearFilters}
                        >
                          Clear All Filters
                        </Button>
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
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
