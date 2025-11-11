import { getProductSingle } from '@/server/products';
import parentCategoryModified from '@/lib/parentCategory';
import { BreadcrumbDynamicContent } from './breadcrumb-dynamic-content';

/**
 * Async component that fetches product data and returns dynamic breadcrumb content
 * This will stream into the static BreadcrumbShell
 */
export default async function ProductBreadcrumbAsync({
  params
}: {
  params: Promise<{ id: string }>
}) {
  "use cache";

  const { id } = await params;
  const product = await getProductSingle(id);

  if (!product) {
    return null;
  }

  const formatCategoryName = (name: string) => {
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatProductTitle = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const categoryName = parentCategoryModified(product.category.name);
  const formattedCategoryName = formatCategoryName(categoryName);
  const formattedProductTitle = formatProductTitle(product.title);

  return (
    <BreadcrumbDynamicContent
      categoryName={formattedCategoryName}
      productTitle={formattedProductTitle}
      categorySlug={categoryName}
    />
  );
}

