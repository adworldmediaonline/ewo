import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import PageSectionsRenderer from '@/components/version-tsx/page-sections-renderer';
// import { ShopCategoryGrid } from '@/features/shop/components/shop-category-grid';
import Wrapper from '@/components/wrapper';
import { getCategoriesShow } from '@/server/categories';
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
  const categories = await getCategoriesShow();

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

        {/* <PageSectionsRenderer pageSlug="shop" sections={pageSections} /> */}

        {/* <section className="w-full py-6 md:py-8" aria-labelledby="shop-heading"> */}
        <PageSectionsRenderer
          pageSlug="shop"
          categories={categories}
        />

      </div>
    </Wrapper>
  );
}
