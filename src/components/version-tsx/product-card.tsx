'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, ShoppingCart, Star, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { notifyError } from '@/utils/toast';
import { useProductCoupon } from '@/hooks/useProductCoupon';

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

export interface Product {
  _id: string;
  title: string;
  sku: string;
  slug: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category: {
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
  options?: Array<{
    title: string;
    price: number;
  }>;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, selectedOption?: any) => void;
  onAddToWishlist?: (product: Product) => void;
  index?: number;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  index = 0,
}: ProductCardProps): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<any>(null);

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

  const imageUrl = product.imageURLs?.[0] || product.img;
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
      : 0;

  // Calculate final price with selected option
  const calculateFinalPrice = () => {
    const basePrice = product.finalPriceDiscount || product.price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(basePrice) + optionPrice).toFixed(2);
  };

  // Calculate marked up price with selected option
  const calculateMarkedUpPrice = () => {
    const basePrice = product.updatedPrice || product.price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(basePrice) + optionPrice).toFixed(2);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if product has options but none are selected
    if (product.options && product.options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    onAddToCart?.(product, selectedOption);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const handleOptionChange = (value: string) => {
    if (value === '') {
      setSelectedOption(null);
    } else {
      const optionIndex = parseInt(value);
      setSelectedOption(product.options?.[optionIndex] || null);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <CardContent className="p-0">
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
              {hasCoupon && couponPercentage && (
                <Badge
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg flex items-center gap-1 px-2 py-1"
                >
                  <Ticket className="h-3 w-3" />
                  <span className="font-bold">{couponPercentage}% OFF</span>
                </Badge>
              )}
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

            {/* Product Image */}
            <div className="relative h-full w-full overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'
                    }`}
                  onLoad={() => setIsImageLoading(false)}
                  loading={index < 8 ? 'eager' : 'lazy'}
                  fetchPriority={index < 4 ? 'high' : undefined}
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
      <div className="flex flex-col h-full px-4 pb-4 pt-1">
        <div className="flex-1">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="mb-1 text-sm font-medium leading-tight hover:text-primary transition-colors cursor-pointer">
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

        {/* Options Selection */}
        {product.options && product.options.length > 0 && (
          <div className="mb-3">
            <Select
              onValueChange={handleOptionChange}
              value={
                selectedOption
                  ? product.options.indexOf(selectedOption).toString()
                  : ''
              }
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                {product.options.map((option, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {option.title}
                    {option.price && Number(option.price) !== 0
                      ? ` (+$${Number(option.price).toFixed(2)})`
                      : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price and Button - Fixed at Bottom */}
        <div className="mt-auto pt-3">
          {/* Price */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-sm text-primary line-through">
              ${calculateMarkedUpPrice()}
            </span>
            <span className="text-lg font-bold">${calculateFinalPrice()}</span>
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
