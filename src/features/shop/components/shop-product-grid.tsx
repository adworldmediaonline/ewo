'use client';

import ProductCard from '@/components/version-tsx/product-card';
import ProductSkeleton from '@/components/version-tsx/product-skeleton';
import type { ShopProduct } from '../shop-types';

interface ShopProductGridProps {
  products: ShopProduct[];
  isLoading: boolean;
  onAddToCart: (product: ShopProduct, selectedOption?: any) => void;
  onAddToWishlist: (product: ShopProduct) => void;
}

const PLACEHOLDER_COUNT = 8;

const ShopProductGrid = ({
  products,
  isLoading,
  onAddToCart,
  onAddToWishlist,
}: ShopProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-3 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={`${product._id}-${index}`}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          index={index}
        />
      ))}

      {isLoading && products.length === 0
        ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, skeletonIndex) => (
          <ProductSkeleton key={`skeleton-${skeletonIndex}`} />
        ))
        : null}
    </div>
  );
};

export default ShopProductGrid;

