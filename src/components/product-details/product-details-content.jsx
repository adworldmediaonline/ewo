'use client';
import React, { useState, useEffect } from 'react';
import DetailsWrapper from './details-wrapper';
import DetailsBottomInfo from './details-bottom-info';
import RelatedProducts from './related-products';
import DetailsThumbWrapper from './details-thumb-wrapper';
import styles from '../../app/product/[id]/product-details.module.css';

export default function ProductDetailsContent({ productItem }) {
  const { _id, img, imageURLs, videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);

  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
  }, [img, imageURLs]);

  // handle image active
  const handleImageActive = img => {
    setActiveImg(img);
  };

  return (
    <>
      <div className={styles.productDetails}>
        <div className={styles.productGallery}>
          <DetailsThumbWrapper
            activeImg={activeImg}
            handleImageActive={handleImageActive}
            imageURLs={imageURLs}
            imgWidth={580}
            imgHeight={580}
            videoId={videoId}
            status={status}
          />
        </div>
        <div className={styles.productInfo}>
          <DetailsWrapper
            productItem={productItem}
            handleImageActive={handleImageActive}
            activeImg={activeImg}
          />
        </div>
      </div>

      <div className={styles.productAdditionalInfo}>
        <DetailsBottomInfo productItem={productItem} />
        <RelatedProducts id={_id} />
      </div>
    </>
  );
}
