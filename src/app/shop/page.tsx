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

export const metadata = {
  title: 'EWO - Shop',
  description: 'EWO - Shop',
  alternates: {
    canonical: '/shop',
  },
};

export default async function ShopPage() {
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

        <ShopContentWrapper categories={categories} />
      </div>
    </Wrapper>
  );
}
