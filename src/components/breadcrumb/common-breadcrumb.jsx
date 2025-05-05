'use client';
import React from 'react';
import Link from 'next/link';
import styles from '../../app/cart/cart.module.css';

const CommonBreadcrumb = ({
  title = '',
  subtitle,
  center = false,
  bg_clr = false,
}) => {
  // Format text with title case (first letter of each word capitalized)
  const formatTitleCase = text => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formattedTitle = formatTitleCase(title);
  const formattedSubtitle = formatTitleCase(subtitle || title);

  return (
    <section
      className={styles['breadcrumb-section']}
      style={{ backgroundColor: bg_clr ? '#EFF1F5' : '#f8f9fa' }}
    >
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <nav
              aria-label="Breadcrumb"
              className={`${styles['breadcrumb-nav']} ${
                center ? 'text-center' : ''
              }`}
            >
              <ol className={styles['breadcrumb-list']}>
                <li className={styles['breadcrumb-item']}>
                  <Link href="/" className={styles['breadcrumb-link']}>
                    <span className={styles['breadcrumb-text']}>Home</span>
                  </Link>
                </li>
                <li
                  className={`${styles['breadcrumb-item']} ${styles['breadcrumb-active']}`}
                  aria-current="page"
                >
                  <svg
                    className={styles['chevron-icon']}
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
                  <span className={styles['breadcrumb-current']}>
                    {formattedSubtitle}
                  </span>
                </li>
              </ol>
            </nav>
            {title && (
              <h3 className={styles['breadcrumb-title']}>{formattedTitle}</h3>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommonBreadcrumb;
