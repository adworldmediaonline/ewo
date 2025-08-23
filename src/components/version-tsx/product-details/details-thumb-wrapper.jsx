'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'photoswipe/style.css';
import { useEffect, useMemo, useRef } from 'react';
import CloudinaryImage from '../../common/CloudinaryImage';

// Dynamic import for PhotoSwipe
const PhotoSwipe = dynamic(() => import('photoswipe'), {
  ssr: false,
  loading: () => null,
});

export default function DetailsThumbWrapper({
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 580,
  imgHeight = 580,
  status,
}) {
  const thumbnailsRef = useRef(null);
  const verticalThumbnailsRef = useRef(null);
  const mainImageRef = useRef(null);

  // Memoize items to prevent infinite re-renders
  const items = useMemo(
    () => [
      {
        src: activeImg,
        width: imgWidth,
        height: imgHeight,
      },
      ...(imageURLs?.length > 0
        ? imageURLs
            .filter(url => url !== activeImg)
            .map(url => ({
              src: url,
              width: imgWidth,
              height: imgHeight,
            }))
        : []),
    ],
    [activeImg, imageURLs, imgWidth, imgHeight]
  );

  // Find current item index
  const currentItemIndex = useMemo(
    () => items.findIndex(item => item.src === activeImg),
    [items, activeImg]
  );

  // Helper function to open lightbox
  const openLightbox = () => {
    if (typeof window !== 'undefined' && PhotoSwipe) {
      import('photoswipe')
        .then(({ default: PhotoSwipeClass }) => {
          try {
            // Create a new gallery instance each time
            const newGallery = new PhotoSwipeClass({
              dataSource: items,
              index: currentItemIndex > -1 ? currentItemIndex : 0,
              showHideAnimationType: 'fade',
              showAnimationDuration: 300,
              hideAnimationDuration: 300,
              allowPanToNext: true,
              allowMouseDrag: true,
              allowTouchDrag: true,
              allowKeyboard: true,
              allowWheel: true,
              allowPinch: true,
              allowDoubleTap: true,
              maxZoomLevel: 4,
              minZoomLevel: 0.5,
              zoomAnimationDuration: 300,
              easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
              closeOnVerticalDrag: true,
              closeOnPullDown: true,
              closeOnBackdropClick: true,
              closeOnEscape: true,
              paddingFn: viewportSize => ({
                top: 30,
                bottom: 30,
                left: 70,
                right: 70,
              }),
            });

            // Initialize and show the gallery
            newGallery.init();

            // Clean up the gallery after it's closed
            newGallery.on('close', () => {
              newGallery.destroy();
            });
          } catch (error) {
            console.error('Error creating PhotoSwipe gallery:', error);
          }
        })
        .catch(error => {
          console.error('Error loading PhotoSwipe:', error);
        });
    }
  };

  // Handle thumbnail scroll
  const scrollThumbnails = direction => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const thumbnailWidth = 80;
      const scrollAmount =
        direction === 'left' ? -thumbnailWidth : thumbnailWidth;
      const currentScroll = container.scrollLeft;

      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Scroll to active thumbnail when it changes
  useEffect(() => {
    // For horizontal thumbnails (mobile/tablet)
    if (thumbnailsRef?.current) {
      const activeThumb = thumbnailsRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeThumb) {
        const container = thumbnailsRef.current;
        const scrollLeft =
          activeThumb.offsetLeft -
          container.offsetWidth / 2 +
          activeThumb.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }

    // For vertical thumbnails (desktop only)
    if (verticalThumbnailsRef.current) {
      const activeThumb = verticalThumbnailsRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeThumb) {
        const container = verticalThumbnailsRef.current;
        const scrollTop =
          activeThumb.offsetTop -
          container.offsetHeight / 2 +
          activeThumb.offsetWidth / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeImg]);

  return (
    <div className="space-y-6">
      {/* Main image and vertical thumbnails (Desktop only) */}
      <div className="flex gap-4">
        {/* Vertical thumbnails for desktop only */}
        {imageURLs && imageURLs.length > 0 && (
          <div
            className="hidden lg:flex flex-col gap-3"
            ref={verticalThumbnailsRef}
          >
            {imageURLs.map((url, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className={`w-20 h-20 p-1 rounded-lg border-2 transition-all hover:border-primary focus:border-primary ${
                  activeImg === url
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleImageActive(url)}
                aria-label={`View product image ${i + 1}`}
                data-active={activeImg === url}
              >
                <CloudinaryImage
                  src={url ?? null}
                  alt={`Product thumbnail ${i + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-md"
                  crop="pad"
                  gravity="center"
                />
              </Button>
            ))}
          </div>
        )}

        {/* Main image container */}
        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group">
                <div
                  ref={mainImageRef}
                  className="cursor-zoom-in transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg relative"
                  onClick={() => {
                    openLightbox();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox();
                    }
                  }}
                  aria-label="Click to open image lightbox"
                >
                  <CloudinaryImage
                    src={activeImg}
                    alt="Product main image"
                    width={imgWidth}
                    height={imgHeight}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    className="w-full h-auto aspect-square object-contain"
                    priority={true}
                    crop="pad"
                    gravity="center"
                  />

                  {/* Subtle zoom indicator */}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Search className="w-4 h-4 text-foreground" />
                  </div>
                </div>

                {/* Out of stock badge */}
                {status === 'out-of-stock' && (
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="destructive"
                      className="text-sm font-medium px-3 py-1"
                    >
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced click to zoom hint */}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>
              Click to zoom • Pinch/scroll to zoom • Double-tap to zoom
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal thumbnails (Mobile & Tablet only - hidden on desktop) */}
      {imageURLs && imageURLs.length > 0 && (
        <div className="lg:hidden relative">
          {imageURLs.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-background"
              onClick={() => scrollThumbnails('left')}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide px-2"
            ref={thumbnailsRef}
          >
            {imageURLs.map((url, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className={`w-16 h-16 p-1 rounded-lg border-2 transition-all hover:border-primary focus:border-primary flex-shrink-0 ${
                  activeImg === url
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleImageActive(url)}
                aria-label={`View product image ${i + 1}`}
                data-active={activeImg === url}
              >
                <CloudinaryImage
                  src={url ?? null}
                  alt={`Product thumbnail ${i + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-md"
                  crop="pad"
                  gravity="center"
                />
              </Button>
            ))}
          </div>

          {imageURLs.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-background"
              onClick={() => scrollThumbnails('right')}
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
