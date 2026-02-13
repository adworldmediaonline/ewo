'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Ticket } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useProductCoupon } from '@/hooks/useProductCoupon';
import { ProductLinkIndicatorMinimal } from '@/components/ui/product-link-indicator';
import { CldImage } from 'next-cloudinary';
import {
  getProductImageSrc,
  getProductImageAlt,
  getProductImageTitle,
  isProductImageProxyUrl,
} from '@/lib/product-image';
import Image from 'next/image';

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
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
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
            className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
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

export interface RelatedProduct {
  _id: string;
  title: string;
  sku: string;
  slug?: string;
  img?: string;
  image?: { url: string; fileName?: string; title?: string; altText?: string } | null;
  imageURLs?: string[];
  imageURLsWithMeta?: Array<{ url: string; fileName?: string; title?: string; altText?: string }>;
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category?: {
    name: string;
    id?: string;
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

interface RelatedProductCardProps {
  product: RelatedProduct;
  onAddToCart?: (product: RelatedProduct) => void;
  onAddToWishlist?: (product: RelatedProduct) => void;
}

export default function RelatedProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: RelatedProductCardProps): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  // Get cart and wishlist state
  const { cart_products } = useSelector((state: any) => state.cart);
  const { wishlist } = useSelector((state: any) => state.wishlist);

  // Get coupon information for this product
  const { hasCoupon, couponPercentage } = useProductCoupon(product._id);

  const isAddedToCart = cart_products.some(
    (prd: any) => prd._id === product._id
  );
  const isAddedToWishlist = wishlist.some(
    (prd: any) => prd._id === product._id
  );

  const imageSrc = getProductImageSrc(product);
  const imageAlt = getProductImageAlt(product);
  const imageTitle = getProductImageTitle(product);
  const useProxyForFilename = isProductImageProxyUrl(imageSrc);
  const isCloudinaryAsset =
    typeof imageSrc === 'string' &&
    imageSrc.startsWith('https://res.cloudinary.com/') &&
    imageSrc.includes('/upload/');
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
      : 0;

  // Calculate final selling price (bold) - finalPriceDiscount after coupon discount
  const calculateFinalPrice = () => {
    const basePrice = product.finalPriceDiscount || product.price;
    const priceWithOption = Number(basePrice);

    // Apply coupon discount if available
    if (hasCoupon && couponPercentage) {
      const discountedPrice = priceWithOption * (1 - couponPercentage / 100);
      return discountedPrice.toFixed(2);
    }

    return priceWithOption.toFixed(2);
  };

  // Calculate marked price (strikethrough) - finalPriceDiscount before coupon
  const calculateMarkedPrice = () => {
    const basePrice = product.finalPriceDiscount || product.price;
    return Number(basePrice).toFixed(2);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate final price with coupon discount if active
    const basePrice = product.finalPriceDiscount || product.price;
    let finalPrice = Number(basePrice);

    if (hasCoupon && couponPercentage) {
      finalPrice = finalPrice * (1 - couponPercentage / 100);
    }

    // Pass product with updated finalPriceDiscount
    onAddToCart?.({
      ...product,
      finalPriceDiscount: finalPrice,
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg p-0 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/product/${product.slug || product._id}`}
        className="flex flex-1 flex-col"
        prefetch={true}
        rel="nofollow"
      >
        {/* useLinkStatus loading indicator - shows during navigation */}
        <ProductLinkIndicatorMinimal />

        <CardContent className="p-0 shrink-0">
          <div className="relative aspect-square overflow-hidden p-1">
            {/* Left Side Badges - Stacked vertically */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
              {/* Discount Badge */}
              {product.finalPriceDiscount &&
                product.finalPriceDiscount < product.price && (
                  <Badge
                    variant="destructive"
                    className="shadow-md"
                  >
                    -
                    {Math.round(
                      ((product.price - product.finalPriceDiscount!) /
                        product.price) *
                      100
                    )}
                    %
                  </Badge>
                )}

              {/* Coupon Badge */}
              {/* {hasCoupon && couponPercentage && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg flex items-center gap-1 px-2 py-1">
                  <Ticket className="h-3 w-3" />
                  <span className="font-bold">{couponPercentage}% OFF</span>
                </Badge>
              )} */}
            </div>

            {/* Status Badge - Top Right */}
            {product.status === 'out-of-stock' && (
              <Badge
                variant="secondary"
                className="absolute right-2 top-2 z-10"
              >
                Out of Stock
              </Badge>
            )}

            {/* Product Image - No indexing for search engines */}
            <div
              className="relative h-full w-full overflow-hidden"
              data-noindex="true"
              data-nosnippet="true"
            >
              {imageSrc ? (
                useProxyForFilename ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    title={imageTitle || undefined}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
                    onLoad={() => setIsImageLoading(false)}
                    loading="lazy"
                    fetchPriority="low"
                    unoptimized
                  />
                ) : (
                  <CldImage
                    src={imageSrc}
                    alt={imageAlt}
                    title={imageTitle || undefined}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'
                      }`}
                    onLoad={() => setIsImageLoading(false)}
                    preserveTransformations={isCloudinaryAsset}
                    deliveryType={isCloudinaryAsset ? undefined : 'fetch'}
                    loading="lazy"
                    fetchPriority="low"
                    data-noindex="true"
                  />
                )
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
                className={`absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''
                  }`}
              >
                <div className="absolute right-2 top-2 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    rounded="full"
                    className={`h-8 w-8 ${isAddedToWishlist
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/90 hover:bg-white'
                      }`}
                    onClick={handleAddToWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 ${isAddedToWishlist ? 'fill-current' : ''
                        }`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    rounded="full"
                    className={`h-8 w-8 ${isAddedToCart
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/90 hover:bg-white'
                      }`}
                    onClick={handleAddToCart}
                    disabled={product.status === 'out-of-stock'}
                  >
                    <ShoppingCart
                      className={`h-4 w-4 ${isAddedToCart ? 'fill-current' : ''
                        }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Product Info - Fixed Layout */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-2">
        <div className="flex-1">
          <Link
            href={`/product/${product.slug || product._id}`}
            className="block"
          >
            <h3 className="mb-1.5 text-sm font-medium leading-tight hover:text-primary transition-colors cursor-pointer">
              {product.title}
            </h3>
          </Link>

          {/* Rating - Only show when there are reviews */}
          {product.reviews &&
            product.reviews.length > 0 &&
            averageRating > 0 && (
              <div className="mb-1.5 flex items-center gap-1">
                <StarRating rating={averageRating || 0} />
                <span className="text-xs text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews.length})
                </span>
              </div>
            )}
        </div>

        {/* Price and Button - Fixed at Bottom */}
        <div className="mt-auto pt-3">
          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5">
            {hasCoupon && couponPercentage && (
              <span className="text-xs sm:text-sm text-primary line-through">
                ${calculateMarkedPrice()}
              </span>
            )}
            <span className="text-base sm:text-lg font-bold">
              ${calculateFinalPrice()}
            </span>
          </div>

          {/* Add to Cart Button */}
          {isAddedToCart ? (
            <Link href="/cart" className="w-full block">
              <Button className="w-full" variant="outline" rounded="full">
                View Cart
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full"
              rounded="full"
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
