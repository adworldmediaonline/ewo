import React from 'react';
import styles from './CategoryContentSkeleton.module.css';

export default function CategoryContentSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerAccent}></div>
        <div className={`${styles.title} ${styles.skeleton}`}></div>
        <div className={`${styles.description} ${styles.skeleton}`}></div>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {/* Generate 6 skeleton cards */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.cardTop}></div>
              <div className={styles.cardDecoration}></div>
              <div className={styles.cardInner}>
                <div
                  className={`${styles.categoryTitle} ${styles.skeleton}`}
                ></div>
                <div className={styles.categoryMeta}>
                  <div className={`${styles.shopNow} ${styles.skeleton}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
