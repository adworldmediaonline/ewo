import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import PageSectionsRenderer from '@/components/version-tsx/page-sections-renderer';
import ShopContentWrapper from '@/components/version-tsx/shop-content-wrapper';
import Wrapper from '@/components/wrapper';
import { getCategories } from '@/lib/server-data';
import { getPaginatedProductsServer } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { getActivePageSections } from '@/server/page-sections';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('shop');
  return buildPageMetadata('shop', cmsData, {
    title: 'EWO - Shop',
    description:
      'Browse East West Offroad\'s complete selection of off-road steering parts, DANA 60/44 components, and quality steering kits.',
    canonical: '/shop',
  });
}

type ShopPageProps = {
  searchParams?: Promise<{ category?: string; subcategory?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const hasCategoryFilter = Boolean(
    params?.category?.trim() || params?.subcategory?.trim()
  );

  // Parallelize: fetch categories, page sections, and initial products
  const [categories, pageSections, initialProductsResult] = await Promise.all([
    getCategories(),
    hasCategoryFilter ? Promise.resolve([]) : getActivePageSections('shop'),
    getPaginatedProductsServer({
      page: 1,
      limit: 12,
      sortBy: DEFAULT_FILTERS.sortBy,
      sortOrder: DEFAULT_FILTERS.sortOrder,
    }),
  ]);

  const rawProducts = initialProductsResult?.data ?? [];
  const initialPagination = initialProductsResult?.pagination ?? null;
  const initialProducts = await enrichProductsWithDisplayPrices(
    rawProducts as Array<{ _id: string; price?: number; updatedPrice?: number; finalPriceDiscount?: number }>
  );

  return (
    <Wrapper>
      <div className="container mx-auto px-3 py-6 md:px-6 md:py-8">
        <Breadcrumb className="mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {!hasCategoryFilter && (
          <PageSectionsRenderer pageSlug="shop" sections={pageSections} />
        )}

        <ShopContentWrapper
          categories={categories}
          initialProducts={initialProducts as any[]}
          initialPagination={initialPagination}
        />
      </div>
    </Wrapper>
  );
}
