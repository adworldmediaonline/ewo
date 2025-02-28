import React from 'react';
import styles from '../../../styleModules/Category.module.css';
import Link from 'next/link';

function ChildCategoryCard({ category, index, parentCategory }) {
  // Format category by replacing spaces with hyphens and converting to lowercase
  const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');

  // Create URL with both parent category and subcategory
  const url = parentCategory
    ? `/shop?category=${parentCategory}&subCategory=${formattedCategory}`
    : `/shop?subCategory=${formattedCategory}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{category}</h3>
        <Link href={url} className={styles.link}>
          <span>Browse Products</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.linkIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default ChildCategoryCard;
