import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import { Rating } from 'react-simple-star-rating';
import styles from './ProductDetailsContent.module.css';

export default function ReviewItem({ review }) {
  const { comment, createdAt, rating, userId } = review || {};

  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewAvatar}>
        {!userId?.imageURL && (
          <div className={styles.reviewInitial}>
            {userId?.name ? userId.name[0].toUpperCase() : 'U'}
          </div>
        )}
        {userId?.imageURL && (
          <Image
            src={userId.imageURL}
            alt={userId?.name || 'User'}
            width={40}
            height={40}
            className={styles.reviewImage}
          />
        )}
      </div>
      <div className={styles.reviewContent}>
        <div className={styles.reviewHeader}>
          <h3 className={styles.reviewName}>{userId?.name || 'Anonymous'}</h3>
          <span className={styles.reviewDate}>
            {dayjs(createdAt).format('MMMM D, YYYY')}
          </span>
        </div>
        <div className={styles.reviewRating}>
          <Rating
            allowFraction
            size={14}
            initialValue={rating}
            readonly={true}
          />
          <span className={styles.ratingValue}>{rating}/5</span>
        </div>
        <div className={styles.reviewComment}>
          <p>{comment}</p>
        </div>
      </div>
    </div>
  );
}
