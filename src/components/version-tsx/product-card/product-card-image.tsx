'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Heart, Play, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { CldImage } from 'next-cloudinary';
import { ProductLinkIndicatorMinimal } from '@/components/ui/product-link-indicator';

export interface ProductCardImageProps {
  productSlug: string;
  productId: string;
  productTitle: string;
  status: string;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string | null;
  useProxyForFilename: boolean;
  isCloudinaryAsset: boolean;
  loading: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | undefined;
  onLoad: () => void;
  isImageLoading: boolean;
  isHovered: boolean;
  imageContainerRef: React.RefObject<HTMLDivElement | null>;
  videoId?: string;
  onVideoClick?: (e: React.MouseEvent) => void;
  showQuickActions: boolean;
  hideQuickActionsOnMobile?: boolean;
  quickActionsTop?: string;
  onAddToWishlist: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  isAddedToWishlist: boolean;
  isAddedToCart: boolean;
  linkPrefetch?: boolean;
  linkRel?: string;
  aspectRatio?: 'square' | 'auto';
  className?: string;
  linkClassName?: string;
}

const IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

export function ProductCardImage({
  productSlug,
  productId,
  productTitle,
  status,
  imageSrc,
  imageAlt,
  imageTitle,
  useProxyForFilename,
  isCloudinaryAsset,
  loading,
  fetchPriority,
  onLoad,
  isImageLoading,
  isHovered,
  imageContainerRef,
  videoId,
  onVideoClick,
  showQuickActions,
  hideQuickActionsOnMobile = false,
  quickActionsTop = 'top-2',
  onAddToWishlist,
  onAddToCart,
  isAddedToWishlist,
  isAddedToCart,
  linkPrefetch = true,
  linkRel,
  aspectRatio = 'square',
  className = '',
  linkClassName = '',
}: ProductCardImageProps) {
  const imageContent = (
    <>
      <ProductLinkIndicatorMinimal />
      <CardContent className={`p-0 ${linkClassName ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
        <div
          className={`relative overflow-hidden p-0.5 sm:p-1 ${
            aspectRatio === 'square' ? 'aspect-square' : 'flex-1 min-h-0'
          } ${className}`}
        >
          <div className="absolute left-1 top-1 sm:left-2 sm:top-2 z-10 flex flex-col gap-1 sm:gap-2">
            {videoId && onVideoClick && (
              <button
                onClick={onVideoClick}
                className="group/video relative flex items-center gap-1 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                aria-label="Watch product video"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onVideoClick(e as unknown as React.MouseEvent);
                  }
                }}
              >
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white" />
                <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide">
                  Video
                </span>
              </button>
            )}
          </div>

          {status === 'out-of-stock' && (
            <Badge
              variant="secondary"
              className="absolute right-1 top-1 sm:right-2 sm:top-2 z-10 text-[9px] sm:text-xs px-1 py-0 sm:px-2.5 sm:py-0.5"
            >
              Out of Stock
            </Badge>
          )}

          {status !== 'out-of-stock' && (
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10">
              <div
                className="rounded-full bg-linear-to-r from-emerald-500 to-green-600 text-white border-2 border-white shadow-lg flex flex-col items-center justify-center text-center h-14 w-14 sm:h-16 sm:w-16"
                style={{ borderRadius: '50%' }}
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

          <div
            ref={imageContainerRef as React.RefObject<HTMLDivElement>}
            className="relative h-full w-full overflow-hidden"
          >
            {imageSrc ? (
              useProxyForFilename ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  title={imageTitle || undefined}
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  }`}
                  sizes={IMAGE_SIZES}
                  loading={loading}
                  fetchPriority={fetchPriority}
                  onLoad={onLoad}
                  unoptimized
                />
              ) : (
                <CldImage
                  src={imageSrc}
                  alt={imageAlt}
                  title={imageTitle || undefined}
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  }`}
                  sizes={IMAGE_SIZES}
                  loading={loading}
                  fetchPriority={fetchPriority}
                  preserveTransformations={isCloudinaryAsset}
                  deliveryType={isCloudinaryAsset ? undefined : 'fetch'}
                  onLoad={onLoad}
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}

            {isImageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            {showQuickActions && (
              <div
                className={`absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 ${
                  hideQuickActionsOnMobile ? 'hidden sm:block' : ''
                } ${isHovered ? 'opacity-100' : ''}`}
              >
                <div className={`absolute right-2 flex flex-col gap-2 z-10 ${quickActionsTop}`}>
                  <Button
                    size="icon"
                    variant="outline"
                    rounded="full"
                    className={`h-8 w-8 ${
                      isAddedToWishlist ? 'bg-primary text-primary-foreground' : 'bg-white/90 hover:bg-white'
                    }`}
                    onClick={onAddToWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 ${isAddedToWishlist ? 'fill-current' : ''}`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    rounded="full"
                    className={`h-8 w-8 ${
                      isAddedToCart ? 'bg-primary text-primary-foreground' : 'bg-white/90 hover:bg-white'
                    }`}
                    onClick={onAddToCart}
                    disabled={status === 'out-of-stock'}
                  >
                    <ShoppingCart
                      className={`h-4 w-4 ${isAddedToCart ? 'fill-current' : ''}`}
                    />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );

  const linkClasses = linkClassName
    ? `block flex flex-col h-full ${linkClassName}`
    : 'block';

  return (
    <Link
      href={`/product/${productSlug}`}
      className={linkClasses}
      prefetch={linkPrefetch}
      rel={linkRel}
    >
      {imageContent}
    </Link>
  );
}
