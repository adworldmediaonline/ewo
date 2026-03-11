import { getPaginatedProductsServer } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { getStoreCouponSettings, getActiveCoupons } from '@/lib/store-api';
import ShopContentWrapper from '@/components/version-tsx/shop-content-wrapper';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';
import type { CategoryItem } from '@/lib/server-data';
import type { ShopFiltersState } from '@/features/shop/shop-types';

interface ShopProductSectionProps {
  categories: CategoryItem[];
  categorySlug?: string;
  subcategorySlug?: string;
}

export async function ShopProductSection({
  categories,
  categorySlug,
  subcategorySlug,
}: ShopProductSectionProps) {
  const filters = {
    category: categorySlug?.trim() || undefined,
    subcategory: subcategorySlug?.trim() || undefined,
    sortBy: DEFAULT_FILTERS.sortBy,
    sortOrder: DEFAULT_FILTERS.sortOrder,
  };

  // Fetch products and enrichment data in parallel to reduce time-to-first paint
  const [initialProductsResult, settings, coupons] = await Promise.all([
    getPaginatedProductsServer({
      page: 1,
      limit: 12,
      ...filters,
    }),
    getStoreCouponSettings(),
    getActiveCoupons(),
  ]);

  const rawProducts = initialProductsResult?.data ?? [];
  const initialPagination = initialProductsResult?.pagination ?? null;
  const initialProducts = await enrichProductsWithDisplayPrices(
    rawProducts as Array<{
      _id: string;
      price?: number;
      updatedPrice?: number;
      finalPriceDiscount?: number;
    }>,
    { settings, coupons }
  );

  const initialFilters: ShopFiltersState = {
    search: '',
    category: filters.category || '',
    subcategory: filters.subcategory || '',
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  return (
    <ShopContentWrapper
      categories={categories}
      initialProducts={initialProducts as unknown as import('@/features/shop/shop-types').ShopProduct[]}
      initialPagination={initialPagination}
      initialFilters={initialFilters}
    />
  );
}
