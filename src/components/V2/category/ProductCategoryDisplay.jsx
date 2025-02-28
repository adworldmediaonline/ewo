import React from 'react';
import styles from '../../../styleModules/Category.module.css';
import Link from 'next/link';

function ProductCategoryDisplay({ title, categories }) {
  const columnClass = categories.length > 2 ? styles.threeColumns : '';

  return (
    <div className={styles.productCategoryContainer}>
      <h1 className={styles.productCategoryTitle}>{title}</h1>
      <div className={styles.productCategoryDivider}></div>

      <div className={`${styles.productCategoryGrid} ${columnClass}`}>
        {categories.map((category, index) => (
          <div key={index} className={styles.productCard}>
            <h2 className={styles.productTitle}>{category.title}</h2>
            <Link
              href={category.link || '/shop'}
              className={styles.productLink}
            >
              Browse Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.productLinkIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCategoryDisplay;
