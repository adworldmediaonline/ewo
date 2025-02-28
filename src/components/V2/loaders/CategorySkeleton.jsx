import React from 'react';
import styles from '../../../styleModules/Category.module.css';

function CategorySkeleton() {
  return (
    <div className={styles.container}>
      <div className={`${styles.skeletonTitle} ${styles.skeleton}`}></div>
      <div className={`${styles.skeletonDescription} ${styles.skeleton}`}></div>

      <div className={styles.grid}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <div
              className={`${styles.skeletonCardTitle} ${styles.skeleton}`}
            ></div>
            <div
              className={`${styles.skeletonCardLink} ${styles.skeleton}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySkeleton;
