'use client';
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import styles from '../../app/product/[id]/product-details.module.css';
import ReviewForm from '../forms/review-form';
import ReviewItem from './review-item';

const DetailsTabNav = ({ product }) => {
  const { _id, description, additionalInformation, reviews } = product || {};
  const [activeTab, setActiveTab] = useState('desc');

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tab} ${
            activeTab === 'desc' ? styles.tabActive : ''
          }`}
          onClick={() => handleTabChange('desc')}
        >
          Description
        </button>
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
            {/* Reviews Summary Header */}
            <div className={styles.reviewsSummaryHeader}>
              <div className={styles.reviewsSummaryLeft}>
                <h3 className={styles.reviewsTitle}>
                  {reviews && reviews.length > 0
                    ? 'Customer Reviews'
                    : 'No Reviews Yet'}
                </h3>
                <div className={styles.reviewsCount}>
                  {reviews && reviews.length > 0 ? (
                    <span className={styles.reviewsBadge}>
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className={styles.noReviewsBadge}>
                      Be the first to review!
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.reviewsSummaryRight}>
                <div className={styles.overallRating}>
                  {reviews && reviews.length > 0 && (
                    <>
                      <div className={styles.ratingNumber}>
                        {(
                          reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                          ) / reviews.length
                        ).toFixed(1)}
                      </div>
                      <div className={styles.ratingStars}>
                        <Rating
                          allowFraction
                          size={20}
                          initialValue={
                            reviews.reduce(
                              (sum, review) => sum + review.rating,
                              0
                            ) / reviews.length
                          }
                          readonly={true}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Content Layout - Desktop Aside, Mobile Below */}
            <div className={styles.reviewsContentLayout}>
              {/* Reviews List */}
              <div className={styles.reviewsListSection}>
                {reviews && reviews.length > 0 ? (
                  <div className={styles.reviewsGrid}>
                    {reviews.map(item => (
                      <ReviewItem key={item._id} review={item} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noReviewsPlaceholder}>
                    <div className={styles.noReviewsIcon}>⭐</div>
                    <h4>No reviews yet</h4>
                    <p>
                      Be the first to share your experience with this product!
                    </p>
                  </div>
                )}
              </div>

              {/* Review Form Aside */}
              <div className={styles.reviewFormAside}>
                <div className={styles.reviewFormSection}>
                  <div className={styles.reviewFormHeader}>
                    <h3 className={styles.reviewFormTitle}>
                      Share Your Experience
                    </h3>
                    <p className={styles.reviewFormSubtitle}>
                      Your email address will not be published. Required fields
                      are marked *
                    </p>
                  </div>
                  <div className={styles.reviewFormWrapper}>
                    <ReviewForm product_id={_id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsTabNav;
