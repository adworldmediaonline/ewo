import React from 'react';
import Link from 'next/link';
import styles from '../../app/shop/shop.module.css';

const ShopBreadcrumb = ({ title = 'Shop', subtitle }) => {
  return (
    <div className={styles.breadcrumb}>
      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumbLinks}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopBreadcrumb;
