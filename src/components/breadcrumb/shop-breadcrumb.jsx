import React from 'react';
import Link from 'next/link';
import styles from '../../app/shop/shop.module.css';

const ShopBreadcrumb = ({ title = 'Shop', subtitle }) => {
  // Function to format text with title case (first letter of each word capitalized)
  const formatTitleCase = text => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formattedSubtitle = subtitle
    ? formatTitleCase(subtitle)
    : formatTitleCase(title);

  return (
    <div className={styles.breadcrumb}>
      <div className={styles.breadcrumbContainer}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <Link href="/" className={styles.breadcrumbLink}>
                <span className={styles.breadcrumbText}>Home</span>
              </Link>
            </li>
            <li
              className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}
              aria-current="page"
            >
              <svg
                className={styles.chevronIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <span className={styles.breadcrumbCurrent}>
                {formattedSubtitle}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default ShopBreadcrumb;
