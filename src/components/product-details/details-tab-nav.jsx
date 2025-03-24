'use client';
import React, { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import ReviewForm from '../forms/review-form';
import ReviewItem from './review-item';
import styles from '../../app/product/[id]/product-details.module.css';

const DetailsTabNav = ({ product }) => {
  const { _id, description, additionalInformation, reviews } = product || {};
  const [activeTab, setActiveTab] = useState('review');

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        {/* <button
          className={`${styles.tab} ${
            activeTab === 'desc' ? styles.tabActive : ''
          }`}
          onClick={() => handleTabChange('desc')}
        >
          Description
        </button> */}
        {additionalInformation && additionalInformation.length > 0 && (
          <button
            className={`${styles.tab} ${
              activeTab === 'additional' ? styles.tabActive : ''
            }`}
            onClick={() => handleTabChange('additional')}
          >
            Additional Information
          </button>
        )}
        <button
          className={`${styles.tab} ${
            activeTab === 'review' ? styles.tabActive : ''
          }`}
          onClick={() => handleTabChange('review')}
        >
          Reviews ({reviews?.length || 0})
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'desc' && (
          <div className={styles.fadeIn}>
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
          <div className={styles.fadeIn}>
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
          <div className={`${styles.reviewsContainer} ${styles.fadeIn}`}>
            <div className={styles.reviewsList}>
              <h3>
                {reviews && reviews.length > 0
                  ? 'Customer Reviews'
                  : 'No Reviews Yet'}
              </h3>

              {reviews && reviews.length > 0 ? (
                reviews.map(item => <ReviewItem key={item._id} review={item} />)
              ) : (
                <p>Be the first to review this product!</p>
              )}
            </div>

            <div className={styles.reviewForm}>
              <h3>Add a Review</h3>
              <p>
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
