'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const RelatedProducts = ({ id }) => {
  // This would typically fetch related products from an API
  // For now, we'll show a placeholder
  const isLoading = false;
  const relatedProducts = [];

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
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
          <Card
            key={product._id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {/* Product image would go here */}
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
              </div>

              {/* Quick action buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Status badge */}
              {product.status === 'out-of-stock' && (
                <Badge variant="destructive" className="absolute top-2 left-2">
                  Out of Stock
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.category?.name}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {product.updatedPrice &&
                    product.updatedPrice !== product.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${product.updatedPrice}
                      </p>
                    )}
                  <p className="font-semibold text-foreground">
                    ${product.finalPriceDiscount || product.price}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
