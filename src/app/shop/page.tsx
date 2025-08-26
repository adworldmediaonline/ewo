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
import { getCategories, getPaginatedProducts } from '@/lib/server-data';

export const metadata = {
  title: 'EWO - Shop',
  description: 'EWO - Shop',
  alternates: {
    canonical: '/shop',
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Fetch initial data on the server
  const categories = await getCategories();

  // Parse search params for initial product fetch
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = 8;
  const search = typeof params.search === 'string' ? params.search : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const subcategory =
    typeof params.subcategory === 'string' ? params.subcategory : '';
  const sortBy =
    typeof params.sortBy === 'string' ? params.sortBy : 'skuArrangementOrderNo';
  const sortOrder =
    typeof params.sortOrder === 'string' ? params.sortOrder : 'asc';

  // Fetch initial products
  const initialProducts = await getPaginatedProducts({
    page,
    limit,
    search,
    category,
    subcategory,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

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

        <ShopContentWrapper
          initialCategories={categories}
          initialProducts={initialProducts}
          initialFilters={{
            search,
            category,
            subcategory,
            sortBy,
            sortOrder: sortOrder as 'asc' | 'desc',
          }}
        />
      </div>
    </Wrapper>
  );
}
