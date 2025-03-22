import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import { Rating } from 'react-simple-star-rating';
import styles from '../../app/product/[id]/product-details.module.css';

export default function ReviewItem({ review }) {
  const { comment, createdAt, rating, userId } = review || {};

  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewAuthor}>{userId?.name || 'Anonymous'}</div>
        <div className={styles.reviewDate}>
          {dayjs(createdAt).format('MMMM D, YYYY')}
        </div>
      </div>

      <div className={styles.reviewRating}>
        <Rating allowFraction size={16} initialValue={rating} readonly={true} />
      </div>

      <div className={styles.reviewText}>
        <p>{comment}</p>
      </div>
    </div>
  );
}
