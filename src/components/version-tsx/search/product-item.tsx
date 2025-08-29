'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Star rating component
const StarRating = ({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'md';
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add filled stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={`${
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
        } fill-yellow-400 text-yellow-400`}
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-400`}
        />
        <div className="absolute inset-0 overflow-hidden">
          <Star
            className={`${
              size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
            } fill-yellow-400 text-yellow-400`}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      </div>
    );
  }

  // Add empty stars to complete 5 stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-400`}
      />
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  productType?: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category?: {
    name: string;
    id: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: Array<{
    rating: number;
  }>;
}

export default function ProductItem({
  product,
}: {
  product: Product;
}): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const dispatch = useDispatch();

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
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  // Calculate discount percentage
  const discountPercentage =
    product.finalPriceDiscount && product.price
      ? Math.round(
          ((product.price - product.finalPriceDiscount) / product.price) * 100
        )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.status === 'out-of-stock') {
      return;
    }

    const cartProduct = {
      _id: product._id,
      title: product.title,
      img: imageUrl || '',
      price: product.finalPriceDiscount || product.price,
      orderQuantity: 1,
      quantity: product.quantity,
      slug: product.slug,
      shipping: product.shipping || { price: 0 },
      finalPriceDiscount: product.finalPriceDiscount || product.price,
    };

    dispatch(add_cart_product(cartProduct));
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistProduct = {
      _id: product._id,
      title: product.title,
      img: imageUrl || '',
      price: product.price,
      category: product.category,
      slug: product.slug,
      finalPriceDiscount: product.finalPriceDiscount,
      updatedPrice: product.updatedPrice,
    };

    dispatch(add_to_wishlist(wishlistProduct));
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-border hover:border-primary/20 p-0 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block flex-1">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative aspect-square overflow-hidden p-1">
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="absolute left-2 top-2 z-10 font-semibold"
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
            <div className="relative h-full w-full overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-contain transition-transform duration-300 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  }`}
                  onLoad={() => setIsImageLoading(false)}
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-sm">
                    No Image
                  </span>
                </div>
              )}

              {/* Loading Overlay */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Quick Action Buttons */}
              <div
                className={`absolute inset-0 bg-black/20 opacity-0 transition-all duration-300 ${
                  isHovered ? 'opacity-100' : ''
                }`}
              >
                <div className="absolute right-2 top-2 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className={`h-8 w-8 rounded-full ${
                      isAddedToWishlist
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white/90 hover:bg-white border-white/50'
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
                    variant="outline"
                    className={`h-8 w-8 rounded-full ${
                      isAddedToCart
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white/90 hover:bg-white border-white/50'
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
        </CardContent>
      </Link>

      {/* Product Info - Flexible Layout */}
      <div className="flex flex-col h-full px-4 pb-4 pt-1 flex-1">
        <div className="flex-1 space-y-2">
          {/* Category */}
          {product.category && (
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.category.name}
            </div>
          )}

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-medium leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-2 min-h-[2.5rem] mb-1">
              {product.title}
            </h3>
          </Link>

          {/* SKU */}
          {product.sku && (
            <div className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </div>
          )}

          {/* Rating - Only show when there are reviews */}
          {product.reviews &&
            product.reviews.length > 0 &&
            averageRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews.length})
                </span>
              </div>
            )}
        </div>

        {/* Price and Button - Fixed at Bottom */}
        <div className="mt-auto pt-3 space-y-3">
          {/* Price */}
          <div className="flex items-center gap-2">
            {product.updatedPrice &&
            product.finalPriceDiscount &&
            product.updatedPrice !== product.finalPriceDiscount ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${Number(product.updatedPrice).toFixed(2)}
                </span>
                <span className="text-lg font-bold text-primary">
                  ${Number(product.finalPriceDiscount).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {isAddedToCart ? (
            <Link href="/cart" className="w-full block">
              <Button className="w-full" variant="outline" size="sm">
                View Cart
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={handleAddToCart}
              disabled={product.status === 'out-of-stock'}
            >
              {product.status === 'out-of-stock'
                ? 'Out of Stock'
                : 'Add to Cart'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
