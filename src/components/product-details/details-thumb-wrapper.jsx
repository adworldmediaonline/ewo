'use client';
import React, { useState, useRef, useEffect } from 'react';
import CloudinaryImage from '../common/CloudinaryImage';
import styles from '../../app/product/[id]/product-details.module.css';

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

  // Handle thumbnail scroll
  const scrollThumbnails = direction => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const scrollAmount = direction === 'left' ? -120 : 120;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
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
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
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
          <div className={styles.mainImage}>
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
              }}
              priority={true}
            />
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
    </div>
  );
}
