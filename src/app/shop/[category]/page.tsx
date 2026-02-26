import { notFound } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ShopContentWrapper from '@/components/version-tsx/shop-content-wrapper';
import Wrapper from '@/components/wrapper';
import { getCategories } from '@/lib/server-data';
import { getCategoryBySlug } from '@/lib/shop-url-utils';
import { getPaginatedProductsServer } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';
import { CategoryCard } from '@/components/version-tsx/categories/category-card';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';

const METADATA_BASE = 'https://www.eastwestoffroad.com';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = getCategoryBySlug(categories, categorySlug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title =
    category.bannerTitle?.trim() || category.parent
      ? `${category.parent} | East West Offroad`
      : 'East West Offroad';
  const description =
    category.bannerDescription?.trim() ||
    category.description?.trim() ||
    `Shop ${category.parent} - quality off-road steering parts and components.`;

  return {
    metadataBase: new URL(METADATA_BASE),
    title,
    description,
    alternates: {
      canonical: `${METADATA_BASE}/shop/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = getCategoryBySlug(categories, categorySlug);

  if (!category) {
    notFound();
  }

  const [initialProductsResult] = await Promise.all([
    getPaginatedProductsServer({
      page: 1,
      limit: 12,
      sortBy: DEFAULT_FILTERS.sortBy,
      sortOrder: DEFAULT_FILTERS.sortOrder,
      category: categorySlug,
    }),
  ]);

  const rawProducts = initialProductsResult?.data ?? [];
  const initialPagination = initialProductsResult?.pagination ?? null;
  const initialProducts = await enrichProductsWithDisplayPrices(
    rawProducts as Array<{
      _id: string;
      price?: number;
      updatedPrice?: number;
      finalPriceDiscount?: number;
    }>
  );

  const processedForCategory = processCategoriesForShowcase(categories).filter(
    (item) =>
      item.parentCategorySlug === categorySlug && item.subcategorySlug
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
              <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.parent}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {processedForCategory.length > 0 && (
          <section
            className="mb-6 md:mb-8"
            aria-label="Browse by subcategory"
          >
            <h2 className="text-lg font-semibold mb-4">Browse by subcategory</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {processedForCategory.map((item, index) => (
                <CategoryCard
                  key={item._id}
                  item={item}
                  index={index}
                  variant="mega"
                />
              ))}
            </div>
          </section>
        )}

        <ShopContentWrapper
          categories={categories}
          initialCategory={categorySlug}
          initialSubcategory=""
          initialProducts={initialProducts as any[]}
          initialPagination={initialPagination}
        />
      </div>
    </Wrapper>
  );
}
