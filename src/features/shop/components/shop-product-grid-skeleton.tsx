'use client';

import ProductSkeleton from '@/components/version-tsx/product-skeleton';

const PLACEHOLDER_COUNT = 8;

export default function ShopProductGridSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
