'use client';
import React from 'react';
import Image from 'next/image';
import payment_option_img from '@assets/img/product/icons/payment-option.png';
import DetailsTabNav from './details-tab-nav';
import styles from '../../app/product/[id]/product-details.module.css';

const DetailsBottomInfo = ({ productItem }) => {
  const { sku, category } = productItem || {};

  return (
    <div className={styles.tabsContainer}>
      <DetailsTabNav product={productItem} />

      {/* product-details-query */}
      <div className="tp-product-details-query">
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>SKU: </span>
          <p>{sku}</p>
        </div>
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>Category: </span>
          <p>{category?.name}</p>
        </div>
      </div>

      {/* product-details-msg */}
      <div className="tp-product-details-msg mb-15">
        <ul>
          <li>30 days easy returns</li>
          <li>Secure payments with leading payment providers</li>
        </ul>
      </div>

      {/* product-details-payment */}
      <div className="tp-product-details-payment d-flex align-items-center flex-wrap justify-content-between">
        <p>
          Guaranteed safe <br /> & secure checkout
        </p>
        <Image src={payment_option_img} alt="payment_option_img" />
      </div>
    </div>
  );
};

export default DetailsBottomInfo;
