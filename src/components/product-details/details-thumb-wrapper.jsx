'use client';
import React, { useState } from 'react';
import CloudinaryImage from '../common/CloudinaryImage';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import styles from '../../app/product/[id]/product-details.module.css';

const DetailsThumbWrapper = ({
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 580,
  imgHeight = 580,
  status,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  return (
    <>
      <div className={styles.mainImage}>
        <div onClick={() => setIsLightboxOpen(true)}>
          <CloudinaryImage
            src={activeImg}
            alt="Product main image"
            width={imgWidth}
            height={imgHeight}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              backgroundColor: '#ffffff',
              cursor: 'zoom-in',
            }}
            crop="pad"
            quality="auto"
            format="auto"
            dpr="auto"
            priority={true}
          />
        </div>

        {status === 'out-of-stock' && (
          <div className={styles.productBadge}>Out of Stock</div>
        )}
      </div>

      {imageURLs && imageURLs.length > 0 && (
        <div className={styles.thumbnailsContainer}>
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
                  objectFit: 'cover',
                  display: 'block',
                }}
                crop="fill"
                gravity="auto"
                quality="auto"
                format="auto"
                dpr="auto"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={slides}
        plugins={[Zoom]}
        index={currentSlideIndex > -1 ? currentSlideIndex : 0}
      />
    </>
  );
};

export default DetailsThumbWrapper;
