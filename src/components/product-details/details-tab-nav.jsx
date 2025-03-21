'use client';
import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import ReviewForm from '../forms/review-form';
import ReviewItem from './review-item';
import styles from './ProductDetailsContent.module.css';

const DetailsTabNav = ({ product }) => {
  const { _id, description, additionalInformation, reviews } = product || {};
  const [activeTab, setActiveTab] = useState('desc');

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  return (
    <div className={styles.tabContentInner}>
      <div className={styles.tabList}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'desc' ? styles.active : ''
          }`}
          onClick={() => handleTabChange('desc')}
        >
          Description
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'additional' ? styles.active : ''
          }`}
          onClick={() => handleTabChange('additional')}
        >
          Additional Information
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'review' ? styles.active : ''
          }`}
          onClick={() => handleTabChange('review')}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'desc' && (
          <div>
            {description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(description),
                }}
              />
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'additional' && (
          <div>
            {additionalInformation && additionalInformation.length > 0 ? (
              <table className={styles.additionalTable}>
                <tbody>
                  {additionalInformation.map((item, i) => (
                    <tr key={i}>
                      <td>{item.key}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No additional information available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className={styles.reviewsContainer}>
            <div className={styles.reviewsList}>
              <h3 className={styles.reviewsTitle}>
                {reviews.length > 0 ? 'Customer Reviews' : 'No Reviews Yet'}
              </h3>

              {reviews.length > 0 ? (
                reviews.map(item => <ReviewItem key={item._id} review={item} />)
              ) : (
                <p>Be the first to review this product!</p>
              )}
            </div>

            <div className={styles.reviewForm}>
              <h3 className={styles.reviewFormTitle}>Add a Review</h3>
              <p className={styles.reviewFormSubtitle}>
                Your email address will not be published. Required fields are
                marked *
              </p>
              <ReviewForm product_id={_id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsTabNav;
