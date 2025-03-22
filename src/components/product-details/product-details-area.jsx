'use client';
import React from 'react';
import PrdDetailsLoader from '../loader/prd-details-loader';
import ErrorMsg from '../common/error-msg';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsContent from './product-details-content';
import styles from '../../app/product/[id]/product-details.module.css';
import Image from 'next/image';

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

        <div className={styles.infoSection}>
          <div className={styles.infoTitle}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect>
              <line x1="1" y1="9" x2="23" y2="9"></line>
              <path d="M12 14l4 2-4 2-4-2 4-2"></path>
            </svg>
            Delivery & Returns
          </div>
          <ul className={styles.infoList}>
            <li className={styles.infoListItem}>
              Free standard shipping on orders over $100
            </li>
            <li className={styles.infoListItem}>
              Express delivery available (2-3 business days)
            </li>
            <li className={styles.infoListItem}>Easy returns within 30 days</li>
            <li className={styles.infoListItem}>
              Secure payments with leading payment providers
            </li>
          </ul>

          <div className={styles.infoTitle} style={{ marginTop: '1.5rem' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Secure Payment
          </div>
          <div className={styles.paymentMethods}>
            <div className={styles.paymentMethod}>
              <svg width="40" height="25" viewBox="0 0 40 25" fill="#1A1F71">
                <path d="M14.4 18.4H12V10.6H14.4V18.4ZM21.7 13.3C21 13 20.5 12.8 20.5 12.4C20.5 12 20.9 11.8 21.5 11.8C22.2 11.8 22.7 12 23.3 12.4L23.8 10.8C23.2 10.4 22.3 10.2 21.5 10.2C19.8 10.2 18.5 11.2 18.5 12.5C18.5 13.5 19.5 14.1 20.1 14.4C20.8 14.7 21.1 15 21.1 15.3C21.1 15.8 20.6 16 20 16C19.1 16 18.4 15.7 17.9 15.3L17.4 16.9C18 17.3 18.9 17.6 19.9 17.6C21.9 17.6 23.1 16.6 23.1 15.2C23.1 14.1 22.3 13.5 21.7 13.3ZM28.3 18.4L26.7 10.6H24.7L26.9 18.4H28.3ZM33.6 18.4L36.5 10.6H34.6L32.8 15.8L32.1 11.8C32 11.1 31.5 10.6 30.8 10.6H27.8L27.7 10.8C28.4 11 29 11.2 29.5 11.5L30.8 18.4H33.6Z" />
              </svg>
            </div>
            <div className={styles.paymentMethod}>
              <svg width="40" height="25" viewBox="0 0 40 25" fill="#EB001B">
                <circle cx="15" cy="12.5" r="6" />
                <circle cx="25" cy="12.5" r="6" fill="#F79E1B" />
                <path
                  d="M20 7.5C21.7 9.2 22.7 11.7 22.7 14.5C22.7 17.3 21.7 19.8 20 21.5C18.3 19.8 17.3 17.3 17.3 14.5C17.3 11.7 18.3 9.2 20 7.5Z"
                  fill="#FF5F00"
                />
              </svg>
            </div>
            <div className={styles.paymentMethod}>
              <svg width="40" height="25" viewBox="0 0 40 25">
                <path
                  d="M30.3 9.9H28.4C28.4 11.7 26.9 13.1 25.1 13.1C23.2 13.1 21.8 11.7 21.8 9.9H9.7V15.2C9.7 17 11.2 18.5 13 18.5H27C28.8 18.5 30.3 17 30.3 15.2V9.9Z"
                  fill="#003087"
                />
                <path
                  d="M25.1 6.7C26.9 6.7 28.3 8.1 28.4 9.9H30.3V8.1C30.3 6.3 28.8 4.8 27 4.8H13C11.2 4.8 9.7 6.3 9.7 8.1V9.9H21.8C21.9 8.1 23.3 6.7 25.1 6.7Z"
                  fill="#009CDE"
                />
                <path
                  d="M18.7 12.2C18.7 12.5 18.4 12.8 18.1 12.8H17.1C16.8 12.8 16.5 12.5 16.5 12.2V10.7H15.4C15.1 10.7 14.8 10.4 14.8 10.1V9.1C14.8 8.8 15.1 8.5 15.4 8.5H16.5V7C16.5 6.7 16.8 6.4 17.1 6.4H18.1C18.4 6.4 18.7 6.7 18.7 7V8.5H19.8C20.1 8.5 20.4 8.8 20.4 9.1V10.1C20.4 10.4 20.1 10.7 19.8 10.7H18.7V12.2Z"
                  fill="#003087"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <>{content}</>;
};

export default ProductDetailsArea;
