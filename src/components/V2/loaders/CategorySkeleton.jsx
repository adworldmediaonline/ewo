import React from 'react';
import styles from './CategorySkeleton.module.css';

export default function CategorySkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.title} ${styles.skeleton}`}></div>
        <div className={`${styles.subtitle} ${styles.skeleton}`}></div>
      </div>

      <div className={styles.grid}>
        {[...Array(12)].map((_, index) => (
          <div key={index} className={styles.card}>
            <div className={`${styles.image} ${styles.skeleton}`}></div>
            <div className={styles.content}>
              <div
                className={`${styles.categoryTitle} ${styles.skeleton}`}
              ></div>
              <div className={`${styles.count} ${styles.skeleton}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
