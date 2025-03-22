'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import styles from '../../app/product/[id]/product-details.module.css';
// internal
import { useGetRelatedProductsQuery } from '@/redux/features/productApi';
import ProductItem from '../products/fashion/product-item';
import ErrorMsg from '../common/error-msg';
import { HomeNewArrivalPrdLoader } from '../loader';

// slider setting
const slider_setting = {
  slidesPerView: 4,
  spaceBetween: 20,
  navigation: {
    nextEl: '.related-next',
    prevEl: '.related-prev',
  },
  autoplay: {
    delay: 5000,
  },
  breakpoints: {
    1200: {
      slidesPerView: 4,
    },
    992: {
      slidesPerView: 3,
    },
    768: {
      slidesPerView: 2,
    },
    576: {
      slidesPerView: 2,
    },
    0: {
      slidesPerView: 1,
    },
  },
};

const RelatedProducts = ({ id }) => {
  const { data: products, isError, isLoading } = useGetRelatedProductsQuery(id);
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeNewArrivalPrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    const product_items = products.data;
    content = (
      <div className={styles.productsContainer}>
        <Swiper
          {...slider_setting}
          modules={[Autoplay, Navigation]}
          className={styles.productsSlider}
        >
          {product_items.map(item => (
            <SwiperSlide key={item._id}>
              <div className={styles.productCard}>
                <ProductItem product={item} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={styles.sliderNavigation}>
          <button
            className={`${styles.sliderButton} related-prev`}
            aria-label="Previous slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6667 15.8333L5.83333 10L11.6667 4.16667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={`${styles.sliderButton} related-next`}
            aria-label="Next slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.33333 4.16667L14.1667 10L8.33333 15.8333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  return <>{content}</>;
};

export default RelatedProducts;
