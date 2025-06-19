'use client';
import React from 'react';
import PrdDetailsLoader from '../loader/prd-details-loader';
import ErrorMsg from '../common/error-msg';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsContent from './product-details-content';
import styles from '../../app/product/[id]/product-details.module.css';
import parentCategoryModified from '@/lib/parentCategory';

const ProductDetailsArea = ({ id }) => {
  const { data: product, isLoading, isError } = useGetProductQuery(id);

  const formatCategoryName = name => {
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatProductTitle = title => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  let content = null;
  if (isLoading) {
    content = <PrdDetailsLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && product) {
    const categoryName = parentCategoryModified(product.category.name);
    const formattedCategoryName = formatCategoryName(categoryName);
    const formattedProductTitle = formatProductTitle(product.title);

    content = (
      <div className={styles.productContainer}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <a href="/" className={styles.breadcrumbLink}>
                <span className={styles.breadcrumbText}>Home</span>
              </a>
            </li>
            <li className={styles.breadcrumbItem}>
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
              <a
                href={`/shop?category=${categoryName}`}
                className={styles.breadcrumbLink}
              >
                <span className={styles.breadcrumbText}>
                  {formattedCategoryName}
                </span>
              </a>
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
                {formattedProductTitle}
              </span>
            </li>
          </ol>
        </nav>
        <ProductDetailsContent productItem={product} />
      </div>
    );
  }
  return <>{content}</>;
};

export default ProductDetailsArea;
