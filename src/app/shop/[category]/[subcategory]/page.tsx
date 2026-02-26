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
import { toSlug } from '@/lib/server-data';
import {
  fromSubcategoryUrlSlug,
  getCategoryBySlug,
} from '@/lib/shop-url-utils';
import { getPaginatedProductsServer } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';

const METADATA_BASE = 'https://www.eastwestoffroad.com';

type SubcategoryPageProps = {
  params: Promise<{ category: string; subcategory: string }>;
};

function getSubcategoryDisplayName(
  category: { parent: string; children?: string[] },
  subcategorySlug: string
): string {
  const slugs = subcategorySlug.split(',').map((s) => s.trim()).filter(Boolean);
  const names = slugs.map(
    (slug) =>
      category.children?.find((c) => toSlug(c) === slug) || slug
  );
  return names.join(', ');
}

export async function generateMetadata({ params }: SubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategoryUrlSlug } =
    await params;
  const categories = await getCategories();
  const category = getCategoryBySlug(categories, categorySlug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const subcategorySlug = fromSubcategoryUrlSlug(subcategoryUrlSlug, category);
  if (!subcategorySlug) {
    return { title: 'Subcategory Not Found' };
  }

  const subcategoryName = getSubcategoryDisplayName(category, subcategorySlug);
  const title = `${subcategoryName} | ${category.parent} | East West Offroad`;
  const description =
    category.bannerDescription?.trim() ||
    category.description?.trim() ||
    `Shop ${subcategoryName} - quality off-road parts from East West Offroad.`;

  return {
    metadataBase: new URL(METADATA_BASE),
    title,
    description,
    alternates: {
      canonical: `${METADATA_BASE}/shop/${categorySlug}/${subcategoryUrlSlug}`,
    },
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategoryUrlSlug } =
    await params;
  const categories = await getCategories();
  const category = getCategoryBySlug(categories, categorySlug);

  if (!category) {
    notFound();
  }

  const subcategorySlug = fromSubcategoryUrlSlug(subcategoryUrlSlug, category);
  if (!subcategorySlug) {
    notFound();
  }

  const [initialProductsResult] = await Promise.all([
    getPaginatedProductsServer({
      page: 1,
      limit: 12,
      sortBy: DEFAULT_FILTERS.sortBy,
      sortOrder: DEFAULT_FILTERS.sortOrder,
      category: categorySlug,
      subcategory: subcategorySlug,
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

  const subcategoryName = getSubcategoryDisplayName(category, subcategorySlug);

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
              <BreadcrumbLink href={`/shop/${categorySlug}`}>
                {category.parent}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subcategoryName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ShopContentWrapper
          categories={categories}
          initialCategory={categorySlug}
          initialSubcategory={subcategorySlug}
          initialProducts={initialProducts as any[]}
          initialPagination={initialPagination}
        />
      </div>
    </Wrapper>
  );
}
