'use client';
import React from 'react';
import Link from 'next/link';
import styles from '../../app/product/[id]/product-details.module.css';

export default function Breadcrumb({ title, current, productId }) {
  return (
    <div className={styles.breadcrumb}>
      <div className={styles.breadcrumbContent}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/shop" className={styles.breadcrumbLink}>
          Shop
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{current}</span>
      </div>
    </div>
  );
}
