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

  // Fetch categories on the server - same as homepage for consistency
  const categories = await getCategories();

  return (
    <Wrapper>
      <div className="container mx-auto px-4 py-6 md:py-8">
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

        {!hasCategoryFilter && <PageSectionsRenderer pageSlug="shop" />}

        {/* Shop Page Header */}
        {/* <section className="w-full bg-white py-6 md:py-8 lg:py-10 mb-6 md:mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
              Off-Road Steering Parts & DANA 60/44 Components Store
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Browse East West Offroad's complete selection of Quality steering parts, tie rod ends, high steer kits, and off-road suspension components.
            </p>
          </div>
        </section> */}

        <ShopContentWrapper categories={categories} />


        {/* <section className="w-full bg-gradient-to-b from-gray-50 to-white py-10 md:py-14 lg:py-20 mt-8 md:mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10 mb-8 md:mb-12">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed text-center">
                  Browse our complete selection of premium off-road steering components Steering components.. East West Offroad carries everything you need to upgrade your 4x4 steering system, from entry-level improvements to hardcore trail-ready builds.
                </p>
              </div>


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                  Shop by Component Type
                </h2>
                <div className="w-16 h-1 bg-primary mx-auto mb-6 md:mb-8 rounded-full"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                  <div className="p-4 md:p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                      Steering Linkage & Tie Rods
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Heavy-duty tie rod ends for DANA 60 and DANA 44 axles, compatible with lifted trucks, Jeeps, and custom builds running 35"+ tires.
                    </p>
                  </div>


                  <div className="p-4 md:p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                      High Steer Arms & Kits
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Crossover and high steer conversion kits for improved steering geometry on lifted vehicles and extreme off-road builds.
                    </p>
                  </div>


                  <div className="p-4 md:p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                      DANA 60 Components
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Complete DANA 60 steering upgrade kits, studs, adapters, and maintenance parts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    </Wrapper>
  );
}
