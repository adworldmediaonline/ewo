'use client';
import React from 'react';
import PrdDetailsLoader from '../loader/prd-details-loader';
import ErrorMsg from '../common/error-msg';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsContent from './product-details-content';
import styles from '../../app/product/[id]/product-details.module.css';

const ProductDetailsArea = ({ id }) => {
  const { data: product, isLoading, isError } = useGetProductQuery(id);

  let content = null;
  if (isLoading) {
    content = <PrdDetailsLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && product) {
    content = (
      <div className={styles.productContainer}>
        <div className={styles.breadcrumb}>
          <div className={styles.breadcrumbContent}>
            <a href="/" className={styles.breadcrumbLink}>
              Home
            </a>
            <span className={styles.breadcrumbSeparator}>/</span>
            <a href="/shop" className={styles.breadcrumbLink}>
              {product.category.name}
            </a>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{product.title}</span>
          </div>
        </div>
        <ProductDetailsContent productItem={product} />
      </div>
    );
  }
  return <>{content}</>;
};

export default ProductDetailsArea;
