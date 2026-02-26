import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import PageSectionsRenderer from '@/components/version-tsx/page-sections-renderer';
import { ShopCategoryGrid } from '@/features/shop/components/shop-category-grid';
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

export default async function ShopPage() {
  const [categories, pageSections] = await Promise.all([
    getCategories(),
    getActivePageSections('shop'),
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

        <PageSectionsRenderer pageSlug="shop" sections={pageSections} />

        <section className="w-full py-6 md:py-8" aria-labelledby="shop-heading">
          <h1
            id="shop-heading"
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6"
          >
            Collections
          </h1>
          <ShopCategoryGrid categories={categories} />
        </section>
      </div>
    </Wrapper>
  );
}
