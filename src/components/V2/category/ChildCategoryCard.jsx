import React from 'react';
import styles from './CategoryContent.module.css';
import Link from 'next/link';

export default function ChildCategoryCard({ category, index, parentCategory }) {
  // Format category by replacing spaces with hyphens and converting to lowercase
  const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');

  // Create URL with both parent category and subcategory
  const url = parentCategory
    ? `/shop?category=${parentCategory}&subCategory=${formattedCategory}`
    : `/shop?subCategory=${formattedCategory}`;

  return (
    <div
      className={`${styles.categoryCard} ${styles.fadeIn}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardTop}></div>
      <div className={styles.cardDecoration}></div>
      <div className={styles.cardInner}>
        <h3 className={styles.categoryTitle}>{category}</h3>
        <div className={styles.categoryMeta}>
          <Link href={url} className={styles.shopNow}>
            Shop Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.arrowIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
