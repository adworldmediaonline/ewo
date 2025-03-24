'use client';
import React, { useState, useRef, useEffect } from 'react';
import CloudinaryImage from '../common/CloudinaryImage';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import styles from '../../app/product/[id]/product-details.module.css';

export default function DetailsThumbWrapper({
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 580,
  imgHeight = 580,
  status,
}) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailsRef = useRef(null);
  const verticalThumbnailsRef = useRef(null);

  // Prepare slides for lightbox
  const slides =
    imageURLs?.length > 0
      ? imageURLs.map(url => ({
          src: url,
          width: imgWidth * 2,
          height: imgHeight * 2,
        }))
      : [{ src: activeImg, width: imgWidth * 2, height: imgHeight * 2 }];

  // Find current slide index
  const currentSlideIndex = slides.findIndex(slide => slide.src === activeImg);

  // Handle thumbnail scroll
  const scrollThumbnails = direction => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const thumbnailWidth = 80; // Width of thumbnail + gap
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
    // For horizontal thumbnails
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.querySelector(
        `.${styles.thumbnailActive}`
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

    // For vertical thumbnails
    if (verticalThumbnailsRef.current) {
      const activeThumb = verticalThumbnailsRef.current.querySelector(
        `.${styles.thumbnailActive}`
      );
      if (activeThumb) {
        const container = verticalThumbnailsRef.current;
        const scrollTop =
          activeThumb.offsetTop -
          container.offsetHeight / 2 +
          activeThumb.offsetHeight / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeImg, styles.thumbnailActive]);

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryLayout}>
        {/* Vertical thumbnails for desktop */}
        {imageURLs && imageURLs.length > 0 && (
          <div
            className={styles.verticalThumbnails}
            ref={verticalThumbnailsRef}
          >
            {imageURLs.map((url, i) => (
              <button
                key={i}
                className={`${styles.thumbnailVertical} ${
                  url === activeImg ? styles.thumbnailActive : ''
                }`}
                onClick={() => handleImageActive(url)}
                aria-label={`View product image ${i + 1}`}
                type="button"
              >
                <CloudinaryImage
                  src={url ?? null}
                  alt={`Product thumbnail ${i + 1}`}
                  width={80}
                  height={80}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image container */}
        <div className={styles.mainImageWrapper}>
          <div
            className={styles.mainImage}
            onClick={() => setIsLightboxOpen(true)}
          >
            <CloudinaryImage
              src={activeImg}
              alt="Product main image"
              width={imgWidth}
              height={imgHeight}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                cursor: 'zoom-in',
              }}
              priority={true}
            />
          </div>

          <div className={styles.zoomHint}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Click to zoom</span>
          </div>

          {status === 'out-of-stock' && (
            <div className={styles.productBadge}>
              <span>Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal thumbnails (mobile & secondary) */}
      {imageURLs && imageURLs.length > 0 && (
        <div className={styles.horizontalThumbnailsWrapper}>
          {imageURLs.length > 3 && (
            <button
              className={`${styles.thumbnailArrow} ${styles.thumbnailArrowLeft}`}
              onClick={() => scrollThumbnails('left')}
              aria-label="Scroll thumbnails left"
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          <div className={styles.horizontalThumbnails} ref={thumbnailsRef}>
            {imageURLs.map((url, i) => (
              <button
                key={i}
                className={`${styles.thumbnail} ${
                  url === activeImg ? styles.thumbnailActive : ''
                }`}
                onClick={() => handleImageActive(url)}
                aria-label={`View product image ${i + 1}`}
                type="button"
              >
                <CloudinaryImage
                  src={url ?? null}
                  alt={`Product thumbnail ${i + 1}`}
                  width={80}
                  height={80}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </button>
            ))}
          </div>

          {imageURLs.length > 3 && (
            <button
              className={`${styles.thumbnailArrow} ${styles.thumbnailArrowRight}`}
              onClick={() => scrollThumbnails('right')}
              aria-label="Scroll thumbnails right"
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Lightbox component */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={slides}
        plugins={[Zoom]}
        index={currentSlideIndex > -1 ? currentSlideIndex : 0}
        animation={{ zoom: 500 }}
        className={styles.customLightbox}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
        }}
      />
    </div>
  );
}
