import dayjs from 'dayjs';
import { Rating } from 'react-simple-star-rating';
import styles from '../../app/product/[id]/product-details.module.css';

export default function ReviewItem({ review }) {
  const { comment, createdAt, rating, userId, guestName } = review || {};

  return (
    <div className={styles.reviewItemCard}>
      <div className={styles.reviewCardHeader}>
        <div className={styles.reviewAuthorSection}>
          <div className={styles.reviewAuthorAvatar}>
            {(userId?.name || guestName || 'Anonymous').charAt(0).toUpperCase()}
          </div>
          <div className={styles.reviewAuthorInfo}>
            <div
              className={styles.reviewAuthorName}
              style={{ textTransform: 'capitalize' }}
            >
              {userId?.name || guestName || 'Anonymous'}
            </div>
            <div className={styles.reviewDate}>
              {dayjs(createdAt).format('MMMM D, YYYY')}
            </div>
          </div>
        </div>
        <div className={styles.reviewRatingSection}>
          <Rating
            allowFraction
            size={16}
            initialValue={rating}
            readonly={true}
          />
          <span className={styles.ratingValue}>({rating}/5)</span>
        </div>
      </div>

      {comment && (
        <div className={styles.reviewContent}>
          <p className={styles.reviewText}>{comment}</p>
        </div>
      )}
    </div>
  );
}
