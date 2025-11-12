import ProductDetailsContent from './product-details-content';
import RelatedProductsServer from './related-products-server';
import { RelatedProductsSkeleton } from './related-products-skeleton';
import { getProductSingle } from '@/server/products';
import { Suspense } from 'react';

/**
 * Product details area - renders the main product content
 * Uses native fetch with caching for optimal performance
 * Caching is handled at the data fetching layer (products.ts)
 *
 * Follows composition pattern: client component receives server component as children
 * This avoids the "donut pattern" anti-pattern and respects client/server boundaries
 */
export default async function ProductDetailsArea({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const product = await getProductSingle(id);

  if (!product) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-lg">Product not found</p>
      </div>
    );
  }

  return (
    <ProductDetailsContent productItem={product}>
      {/* Related Products - Server component passed as children slot */}
      <div className={product.videoId ? "mt-0" : "mt-16"}>
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsServer productId={product._id} />
        </Suspense>
      </div>
    </ProductDetailsContent>
  );
}
