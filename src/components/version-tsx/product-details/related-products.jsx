'use client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetRelatedProductsQuery } from '@/redux/features/productApi';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import RelatedProductCard from './related-product-card';

const RelatedProducts = ({ id }) => {
  const { data: products, isError, isLoading } = useGetRelatedProductsQuery(id);
  const dispatch = useDispatch();

  // Filter out the current product and limit to 4 related products
  const relatedProducts =
    products?.data?.filter(p => p._id !== id).slice(0, 4) || [];

  // Cart and Wishlist handlers
  const handleAddToCart = product => {
    // Import and dispatch cart action
    import('@/redux/features/cartSlice').then(({ add_cart_product }) => {
      dispatch(add_cart_product(product));
    });
  };

  const handleAddToWishlist = product => {
    // Import and dispatch wishlist action
    import('@/redux/features/wishlist-slice').then(({ add_to_wishlist }) => {
      dispatch(add_to_wishlist(product));
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Related Products
          </h2>
          <p className="text-muted-foreground">
            Discover more products you might like
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error Loading Related Products
        </h3>
        <p className="text-muted-foreground mb-6">
          We encountered an issue while loading related products.
        </p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Related Products
        </h2>
        <p className="text-muted-foreground">
          Discover more products you might like
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map(product => (
          <RelatedProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
