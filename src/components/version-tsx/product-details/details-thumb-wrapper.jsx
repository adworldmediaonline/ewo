'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import CloudinaryImage from '../../common/CloudinaryImage';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import 'photoswipe/dist/photoswipe.css';

// Component that uses the gallery hook
const GalleryContent = ({
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 580,
  imgHeight = 580,
  status,
}) => {
  const thumbnailsRef = useRef(null);
  const verticalThumbnailsRef = useRef(null);

  // Prepare images for react-photoswipe-gallery
  const allImages = [
    activeImg,
    ...(imageURLs?.filter(url => url !== activeImg) || []),
  ];

  // Add CSS to ensure PhotoSwipe arrows are visible
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pswp__button--arrow--prev,
      .pswp__button--arrow--next {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .pswp__button--arrow--prev {
        left: 20px !important;
      }
      .pswp__button--arrow--next {
        right: 20px !important;
      }
      .pswp__img {
        max-width: 90vw !important;
        max-height: 90vh !important;
        object-fit: contain !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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
                {/* Main image display - clickable to open gallery */}
                <Item
                  original={activeImg}
                  thumbnail={activeImg}
                  width={imgWidth}
                  height={imgHeight}
                  alt="Product main image"
                >
                  {({ ref, open }) => (
                    <div
                      ref={ref}
                      className="cursor-zoom-in transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg relative"
                      onClick={open}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          open(e);
                        }
                      }}
                      aria-label="Click to open image lightbox"
                    >
                      {/* Image container - no forced aspect ratio */}
                      <div className="w-full bg-gray-50 flex items-center justify-center p-4">
                        <CloudinaryImage
                          src={activeImg}
                          alt="Product main image"
                          width={imgWidth}
                          height={imgHeight}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                          className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                          priority={true}
                          crop="pad"
                          gravity="center"
                        />
                      </div>

                      {/* Subtle zoom indicator */}
                      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Search className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                  )}
                </Item>

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

      {/* Additional gallery items for remaining images */}
      {imageURLs
        .filter(url => url !== activeImg)
        .map((url, i) => (
          <Item
            key={`gallery-${i + 1}`}
            original={url}
            thumbnail={url}
            width={imgWidth}
            height={imgHeight}
            alt={`Product image ${i + 2}`}
          >
            {({ ref, open }) => (
              <div
                ref={ref}
                onClick={open}
                style={{
                  display: 'none',
                }}
              />
            )}
          </Item>
        ))}
    </div>
  );
};

export default function DetailsThumbWrapper({
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 580,
  imgHeight = 580,
  status,
}) {
  return (
    <Gallery
      options={{
        arrowPrev: true,
        arrowNext: true,
        zoom: true,
        close: true,
        counter: true,
        bgOpacity: 0.9,
      }}
    >
      <GalleryContent
        activeImg={activeImg}
        handleImageActive={handleImageActive}
        imageURLs={imageURLs}
        imgWidth={imgWidth}
        imgHeight={imgHeight}
        status={status}
      />
    </Gallery>
  );
}
