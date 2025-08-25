'use client';
import parentCategoryModified from '@/lib/parentCategory';
import { useGetProductQuery } from '@/redux/features/productApi';

import ProductBreadcrumb from './product-breadcrumb';
import ProductDetailsContent from './product-details-content';
import ProductError from './product-error';
import ProductSkeleton from './product-skeleton';

const ProductDetailsArea = ({ id }) => {
  const { data: product, isLoading, isError, refetch } = useGetProductQuery(id);

  const formatCategoryName = name => {
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatProductTitle = title => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Loading state
  if (isLoading) {
    return <ProductSkeleton />;
  }

  // Error state
  if (isError) {
    return <ProductError onRetry={refetch} />;
  }

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

  // Fallback - should not reach here
  return <ProductError onRetry={refetch} />;
};

export default ProductDetailsArea;
