'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useSelector } from 'react-redux';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  finalPriceDiscount?: number;
  category: {
    name: string;
    id: string;
  };
  status: string;
  quantity: number;
  reviews?: Array<{
    rating: number;
  }>;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  // Get cart and wishlist state
  const { cart_products } = useSelector((state: any) => state.cart);
  const { wishlist } = useSelector((state: any) => state.wishlist);

  const isAddedToCart = cart_products.some(
    (prd: any) => prd._id === product._id
  );
  const isAddedToWishlist = wishlist.some(
    (prd: any) => prd._id === product._id
  );

  const imageUrl = product.imageURLs?.[0] || product.img;
  const hasDiscount =
    product.finalPriceDiscount && product.finalPriceDiscount < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.finalPriceDiscount!) / product.price) * 100
      )
    : 0;

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden">
            {/* Discount Badge */}
            {hasDiscount && (
              <Badge
                variant="destructive"
                className="absolute left-2 top-2 z-10"
              >
                -{discountPercentage}%
              </Badge>
            )}

            {/* Status Badge */}
            {product.status === 'out-of-stock' && (
              <Badge
                variant="secondary"
                className="absolute right-2 top-2 z-10"
              >
                Out of Stock
              </Badge>
            )}

            {/* Product Image */}
            <div className="relative h-full w-full">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-300 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  }`}
                  onLoad={() => setIsImageLoading(false)}
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}

              {/* Loading Overlay */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Quick Action Buttons */}
              <div
                className={`absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : ''
                }`}
              >
                <div className="absolute right-2 top-2 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`h-8 w-8 rounded-full ${
                      isAddedToWishlist
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/90 hover:bg-white'
                    }`}
                    onClick={handleAddToWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isAddedToWishlist ? 'fill-current' : ''
                      }`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`h-8 w-8 rounded-full ${
                      isAddedToCart
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/90 hover:bg-white'
                    }`}
                    onClick={handleAddToCart}
                    disabled={product.status === 'out-of-stock'}
                  >
                    <ShoppingCart
                      className={`h-4 w-4 ${
                        isAddedToCart ? 'fill-current' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {product.category.name}
              </Badge>
            </div>

            <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight">
              {product.title}
            </h3>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="mb-2 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews?.length || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-destructive">
                    ${product.finalPriceDiscount}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold">${product.price}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Add to Cart Button */}
      <CardFooter className="p-4 pt-0">
        {isAddedToCart ? (
          <Link href="/cart" className="w-full">
            <Button className="w-full" variant="outline">
              View Cart
            </Button>
          </Link>
        ) : (
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.status === 'out-of-stock'}
          >
            {product.status === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
