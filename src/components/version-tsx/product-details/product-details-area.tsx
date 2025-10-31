
import parentCategoryModified from '@/lib/parentCategory';

import ProductBreadcrumb from './product-breadcrumb';
import ProductDetailsContent from './product-details-content';
// import ProductSkeleton from './product-skeleton';
import { getProductSingle } from '@/server/products';

export default async function ProductDetailsArea({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  // Pass id directly to cached component
  return <ProductDetailsAreaContent id={id} />;
}

// Cached component - will be prerendered at build time
async function ProductDetailsAreaContent({ id }: { id: string }) {
  "use cache";
  const product = await getProductSingle(id);

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

  // Product content
  if (product) {
    const categoryName = parentCategoryModified(product.category.name);
    const formattedCategoryName = formatCategoryName(categoryName);
    const formattedProductTitle = formatProductTitle(product.title);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductBreadcrumb
          categoryName={formattedCategoryName}
          productTitle={formattedProductTitle}
          categorySlug={categoryName}
        />
        <ProductDetailsContent productItem={product} />
      </div>
    );
  }

  return null;
}
