'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../app/product/[id]/product-details.module.css';
import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import DetailsTabNav from './details-tab-nav';
import RelatedProducts from './related-products';

export default function ProductDetailsContent({ productItem }) {
  const { _id, img, imageURLs, videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);

  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
  }, [img, imageURLs]);

  const handleImageActive = url => {
    setActiveImg(url);
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
            detailsBottom={true}
          />
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <DetailsTabNav product={productItem} />
      </div>

      <div className={styles.relatedProducts}>
        <h2 className={styles.sectionTitle}>Related Products</h2>
        <RelatedProducts id={_id} />
      </div>
    </>
  );
}
