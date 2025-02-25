import React from 'react';
import styles from './CategorySkeleton.module.css';

const CategorySkeleton = () => {
  return (
    <div className={styles.ewoSkeleton}>
      {[1, 2, 3, 4, 5, 6].map(item => (
        <div key={item} className={styles.ewoSkeletonItem}>
          <div
            className={`${styles.ewoSkeletonImage} ${styles.ewoAnimatePulse}`}
          ></div>
          <div className={styles.ewoSkeletonContent}>
            <div
              className={`${styles.ewoSkeletonTitle} ${styles.ewoAnimatePulse}`}
            ></div>
            <div
              className={`${styles.ewoSkeletonCount} ${styles.ewoAnimatePulse}`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;
