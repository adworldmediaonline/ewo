import { getRelatedProducts } from '@/server/products';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import RelatedProductsClient from './related-products-client';

interface RelatedProductsServerProps {
  productId: string;
}

/**
 * Server component for related products
 * Uses native fetch with caching instead of RTK Query
 * Cached with cacheLife('minutes') for fresh recommendations
 */
export default async function RelatedProductsServer({
  productId,
}: RelatedProductsServerProps) {
  const relatedProducts = await getRelatedProducts(productId);

  // Empty state
  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Related Products Found
        </h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find any related products at the moment.
        </p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  // Delegate to client component for interactivity (Swiper, cart actions)
  return <RelatedProductsClient products={relatedProducts} currentProductId={productId} />;
}

