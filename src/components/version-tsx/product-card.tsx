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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, ShoppingCart, Star, Ticket, Settings, Youtube, Play, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { notifyError } from '@/utils/toast';
import { useProductCoupon } from '@/hooks/useProductCoupon';
import { ProductLinkIndicatorMinimal } from '@/components/ui/product-link-indicator';
import { CldImage } from 'next-cloudinary';
import ProductConfigurationDialog from '@/components/version-tsx/product-configuration-dialog';
import ProductBadges from '@/components/version-tsx/product-badges';
import {
  getProductImageSrc,
  getProductImageAlt,
  getProductImageTitle,
  isProductImageProxyUrl,
} from '@/lib/product-image';

type TitleSegment = { kind: 'outside' | 'inside'; text: string };

/**
 * Splits a product title into segments outside vs inside parentheses.
 * Parenthetical segments are wrapped in a span with white-space: nowrap
 * so they never break onto the next line.
 */
const parseTitleSegments = (str: string): TitleSegment[] => {
  const segments: TitleSegment[] = [];
  let current: TitleSegment = { kind: 'outside', text: '' };
  let depth = 0;

  for (const c of str) {
    if (c === '(') {
      if (depth === 0) {
        if (current.text) {
          segments.push(current);
          current = { kind: 'outside', text: '' };
        }
        current = { kind: 'inside', text: '(' };
      } else {
        current.text += c;
      }
      depth += 1;
    } else if (c === ')') {
      depth -= 1;
      current.text += c;
      if (depth === 0) {
        segments.push(current);
        current = { kind: 'outside', text: '' };
      }
    } else {
      current.text += c;
    }
  }

  if (current.text) segments.push(current);
  return segments;
};

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
  image?: { url: string; fileName?: string; title?: string; altText?: string; link?: string } | null;
  imageURLs?: string[];
  imageURLsWithMeta?: Array<{ url: string; fileName?: string; title?: string; altText?: string }>;
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
  productConfigurations?: Array<{
    title: string;
    options: Array<{
      name: string;
      price: number;
      isSelected: boolean;
    }>;
  }>;
  videoId?: string;
  badges?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, selectedOption?: any) => void;
  onAddToWishlist?: (product: Product) => void;
  index?: number;
  badgeVariant?: 'default' | 'top-left' | 'top-right';
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  index = 0,
  badgeVariant = 'default',
}: ProductCardProps): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<any>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  // Check if product has configurations
  const hasConfigurations = React.useMemo(() => {
    const configs = product.productConfigurations;



    if (!configs || !Array.isArray(configs) || configs.length === 0) {
      return false;
    }

    // Check if at least one configuration has options
    const hasValidConfigs = configs.some(
      (config: any) =>
        config &&
        config.options &&
        Array.isArray(config.options) &&
        config.options.length > 0
    );

    return hasValidConfigs;
  }, [product.productConfigurations, product.title, product._id]);

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
  const shouldEagerLoad = index < 8;
  const shouldUseHighPriority = index < 4;
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
      : 0;

  // Calculate final selling price (bold) - finalPriceDiscount after coupon discount
  const calculateFinalPrice = () => {
    // Get base price (original price, not discounted)
    const basePrice = product.finalPriceDiscount || product.price;

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // THEN add option price to the already discounted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;

    return finalPrice.toFixed(2);
  };

  // Calculate marked price (strikethrough) - finalPriceDiscount before coupon
  const calculateMarkedPrice = () => {
    const basePrice = product.finalPriceDiscount || product.price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(basePrice) + optionPrice).toFixed(2);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has configurations, open dialog instead
    if (hasConfigurations) {
      setIsConfigDialogOpen(true);
      return;
    }

    // Check if product has options but none are selected
    if (product.options && product.options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Calculate final price
    // Get base price (original price, not discounted)
    const basePrice = product.finalPriceDiscount || product.price;

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // THEN add option price to the already discounted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;

    // Pass product with calculated final price
    onAddToCart?.(
      { ...product, finalPriceDiscount: finalPrice },
      selectedOption
    );
  };

  const handleChooseOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfigDialogOpen(true);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Include selectedOption and options when adding to wishlist
    const productWithOption = {
      ...product,
      selectedOption: selectedOption || undefined,
      options: product.options || undefined,
      productConfigurations: product.productConfigurations || undefined,
    };
    onAddToWishlist?.(productWithOption);
  };

  const handleOptionChange = (value: string) => {
    if (value === '') {
      setSelectedOption(null);
    } else {
      const optionIndex = parseInt(value);
      setSelectedOption(product.options?.[optionIndex] || null);
    }
  };


  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoModalOpen(true);
    setIsVideoPlaying(false);
  };

  const handleVideoModalClose = (open: boolean) => {
    setIsVideoModalOpen(open);
    if (!open) {
      setIsVideoPlaying(false);
    }
  };

  return (
    <Card
      className="group rounded-md relative overflow-hidden transition-all duration-300 hover:shadow-lg p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block" prefetch={true}>
        {/* useLinkStatus loading indicator - shows during navigation */}
        <ProductLinkIndicatorMinimal />

        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden p-0.5 sm:p-1">
            {/* Product Badges - Top Left Variant */}
            {/* {badgeVariant === 'top-left' && (
              <ProductBadges badges={product.badges || []} variant="top-left" />
            )} */}

            {/* Product Badges - Top Right Variant */}
            {/* {badgeVariant === 'top-right' && (
              <ProductBadges badges={product.badges || []} variant="top-right" />
            )} */}

            {/* Left Side Badges - Stacked vertically */}
            <div className="absolute left-1 top-1 sm:left-2 sm:top-2 z-10 flex flex-col gap-1 sm:gap-2">
              {product.videoId && (
                <button
                  onClick={handleVideoClick}
                  className="group/video relative flex items-center gap-1 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                  aria-label="Watch product video"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleVideoClick(e as unknown as React.MouseEvent);
                    }
                  }}
                >
                  <div className="relative">
                    <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide">
                    Video
                  </span>
                </button>
              )}
              {/* Discount Badge */}
              {/* {product.finalPriceDiscount &&
                product.finalPriceDiscount < product.price && (
                  <Badge
                    variant="destructive"
                    className="shadow-md text-[9px] sm:text-xs px-1 py-0 sm:px-2.5 sm:py-0.5"
                  >
                    -
                    {Math.round(
                      ((product.price - product.finalPriceDiscount!) /
                        product.price) *
                      100
                    )}
                    %
                  </Badge>
                )} */}

              {/* Coupon Badge */}
              {/* {hasCoupon && couponPercentage && (
                <Badge
                  className="bg-linear-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg flex items-center gap-0.5 sm:gap-1 px-1 py-0  sm:px-2 sm:py-1 text-[8px] sm:text-[11px]"
                >

                  <span className="font-medium">GET EXTRA <span className="font-semibold text-[13px]">{couponPercentage}%</span> OFF AT CHECKOUT</span>
                </Badge>
              )} */}
            </div>

            {/* Status Badge - Top Right */}
            {product.status === 'out-of-stock' && (
              <Badge
                variant="secondary"
                className="absolute right-1 top-1 sm:right-2 sm:top-2 z-10 text-[9px] sm:text-xs px-1 py-0 sm:px-2.5 sm:py-0.5"
              >
                Out of Stock
              </Badge>
            )}

            {/* In Stock Seal - Bottom Right */}
            {product.status !== 'out-of-stock' && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10">
                <div
                  className="rounded-full bg-linear-to-r from-emerald-500 to-green-600 text-white border-2 border-white shadow-lg flex flex-col items-center justify-center text-center h-14 w-14 sm:h-16 sm:w-16"
                  style={{
                    borderRadius: '50%',
                  }}
                >
                  <span className="text-[8px] sm:text-[9px] font-bold leading-tight">
                    In Stock
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-medium leading-tight mt-0.5">
                    Ready to Ship
                  </span>
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="relative h-full w-full overflow-hidden">
              {imageSrc ? (
                useProxyForFilename ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    title={imageTitle || undefined}
                    fill
                    className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={shouldEagerLoad ? 'eager' : 'lazy'}
                    fetchPriority={shouldUseHighPriority ? 'high' : undefined}
                    onLoad={() => setIsImageLoading(false)}
                    unoptimized
                  />
                ) : (
                  <CldImage
                    src={imageSrc}
                    alt={imageAlt}
                    title={imageTitle || undefined}
                    fill
                    className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'
                      }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={shouldEagerLoad ? 'eager' : 'lazy'}
                    fetchPriority={shouldUseHighPriority ? 'high' : undefined}
                    preserveTransformations={isCloudinaryAsset}
                    deliveryType={isCloudinaryAsset ? undefined : 'fetch'}
                    onLoad={() => setIsImageLoading(false)}
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

              {/* Quick Action Buttons - Hidden on mobile for cleaner 2-column layout */}
              <div
                className={`absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 hidden sm:block ${isHovered ? 'opacity-100' : ''
                  }`}
              >
                <div className={`absolute right-2 flex flex-col gap-2 z-10 ${hasCoupon && couponPercentage ? 'top-8' : 'top-2'}`}>
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
      <div className="flex flex-col h-full px-2 pb-3 pt-1 sm:px-4 sm:pb-4">
        <div className="flex-1">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="mb-1 text-xs sm:text-sm font-medium leading-tight hover:text-primary transition-colors cursor-pointer">
              {parseTitleSegments(product.title).map((seg, i) =>
                seg.kind === 'inside' ? (
                  <span key={i} className="whitespace-nowrap">
                    {seg.text}
                  </span>
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )}
            </h3>
          </Link>

          {/* Product Badges - Default Position */}
          {/* <ProductBadges badges={product.badges || []} variant="top-right" /> */}

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
          <div className="mb-2 sm:mb-3">
            <Select
              onValueChange={handleOptionChange}
              value={
                selectedOption
                  ? product.options.indexOf(selectedOption).toString()
                  : ''
              }
            >
              <SelectTrigger className="w-full h-7 text-[10px] sm:h-8 sm:text-xs">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                {product.options.map((option, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-[10px] sm:text-xs">
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
        <div className="mt-auto pt-2 sm:pt-3">
          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            {hasCoupon && couponPercentage && (
              <span className="text-[10px] sm:text-sm text-primary line-through">
                ${calculateMarkedPrice()}
              </span>
            )}
            <span className="text-sm sm:text-lg font-bold">${calculateFinalPrice()}</span>
          </div>

          {/* Add to Cart / Choose Options Button */}
          {isAddedToCart ? (
            <Link href="/cart" className="w-full block">
              <Button className="w-full h-8 text-[10px] sm:h-10 sm:text-sm" variant="outline" rounded="full">
                View Cart
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full h-8 text-[10px] sm:h-10 sm:text-sm"
              rounded="full"
              onClick={hasConfigurations ? handleChooseOptions : handleAddToCart}
              disabled={product.status === 'out-of-stock'}
              data-testid={`product-button-${product._id}`}
              data-has-configurations={hasConfigurations}
            >
              {product.status === 'out-of-stock'
                ? 'Out of Stock'
                : hasConfigurations
                  ? 'Choose Options'
                  : 'Add to Cart'}
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Dialog */}
      {hasConfigurations && (
        <ProductConfigurationDialog
          product={product}
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
          onAddToCart={onAddToCart}
        />
      )}

      {/* Video Modal */}
      {product.videoId && (
        <Dialog open={isVideoModalOpen} onOpenChange={handleVideoModalClose}>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-0">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-4 bg-linear-to-b from-black/80 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-white text-sm sm:text-base font-medium line-clamp-2">
                  {product.title}
                </DialogTitle>
                <button
                  onClick={() => handleVideoModalClose(false)}
                  className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 transition-colors"
                  aria-label="Close video"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </button>
              </div>
            </DialogHeader>

            <div className="relative w-full aspect-video bg-black">
              {!isVideoPlaying ? (
                <>
                  {/* YouTube Thumbnail with Play Button Overlay */}
                  <img
                    src={`https://img.youtube.com/vi/${product.videoId}/maxresdefault.jpg`}
                    alt={`${product.title} video thumbnail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300">
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="transform transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Play video"
                    >
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50" />

                        {/* Play button */}
                        <div className="relative bg-red-600 hover:bg-red-700 rounded-full p-4 sm:p-6 shadow-2xl border-4 border-white/90">
                          <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white fill-white ml-0.5 sm:ml-1" />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* YouTube watermark */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2">
                      <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      <span className="text-white text-xs sm:text-sm font-medium">Watch on YouTube</span>
                    </div>
                  </div>

                  {/* HD badge */}
                  <div className="absolute top-14 sm:top-16 left-3 sm:left-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-[10px] sm:text-xs font-semibold">
                      HD
                    </div>
                  </div>
                </>
              ) : (
                /* YouTube iframe player */
                <iframe
                  src={`https://www.youtube.com/embed/${product.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${product.title} - Product Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              )}
            </div>

            {/* Footer with actions */}
            <div className="bg-linear-to-t from-black to-zinc-900 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
                <Youtube className="h-4 w-4 text-red-600" />
                <span>Product Video</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${product.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Open in YouTube
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
