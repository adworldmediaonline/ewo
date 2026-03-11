import { Suspense } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import PageSectionsRenderer from '@/components/version-tsx/page-sections-renderer';
import { ShopProductSection } from '@/features/shop/components/shop-product-section';
import ShopProductGridSkeleton from '@/features/shop/components/shop-product-grid-skeleton';
import Wrapper from '@/components/wrapper';
import { getCategories } from '@/lib/server-data';
import { getActivePageSections } from '@/server/page-sections';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

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

  // Parallelize: fetch categories and page sections (products fetched in ShopProductSection for streaming)
  const [categories, pageSections] = await Promise.all([
    getCategories(),
    hasCategoryFilter ? Promise.resolve([]) : getActivePageSections('shop'),
  ]);

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
          <Suspense
            fallback={
              <div className="min-h-[120px] w-full animate-pulse rounded-lg bg-muted/50" aria-hidden />
            }
          >
            <PageSectionsRenderer
              pageSlug="shop"
              sections={pageSections}
              categories={categories}
            />
          </Suspense>
        )}

        <Suspense
          fallback={
            <div className="min-h-screen py-2 lg:py-6">
              <div className="mb-4 lg:mb-6 h-12 w-full rounded-lg bg-muted/50 animate-pulse" />
              <div className="flex w-full items-start gap-4 lg:gap-8">
                <aside className="hidden lg:block w-56 shrink-0 space-y-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-9 rounded-md bg-muted/50 animate-pulse" />
                  ))}
                </aside>
                <section className="flex-1 min-w-0">
                  <ShopProductGridSkeleton />
                </section>
              </div>
            </div>
          }
        >
          <ShopProductSection
            categories={categories}
            categorySlug={params?.category}
            subcategorySlug={params?.subcategory}
          />
        </Suspense>
      </div>
    </Wrapper>
  );
}
