'use client';
import React, { useState, useEffect } from 'react';
import styles from './ProductDetailsContent.module.css';
import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import { useDispatch } from 'react-redux';
import DetailsTabNav from './details-tab-nav';
import RelatedProducts from './related-products';

export default function ProductDetailsContent({ productItem }) {
  const { _id, img, imageURLs, videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);
  const dispatch = useDispatch();

  // active image change when img change
  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
  }, [img, imageURLs]);

  // handle image active
  const handleImageActive = url => {
    setActiveImg(url);
  };

  return (
    <section className={styles.productSection}>
      <div className={styles.productTop}>
        <div className={styles.container}>
          <div className={styles.productGrid}>
            <div className={styles.imageWrapper}>
              <DetailsThumbWrapper
                activeImg={activeImg}
                handleImageActive={handleImageActive}
                imageURLs={imageURLs}
                imgWidth={580}
                imgHeight={670}
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
        </div>
      </div>

      <div className={styles.tabsSection}>
        <div className={styles.container}>
          <div className={styles.tabContent}>
            <DetailsTabNav product={productItem} />
          </div>
        </div>
      </div>

      <section className={styles.relatedSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Related Products</h2>
          <RelatedProducts id={_id} />
        </div>
      </section>
    </section>
  );
}
