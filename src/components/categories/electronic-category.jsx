'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
// internal
import ErrorMsg from '../common/error-msg';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { useGetProductTypeCategoryQuery } from '@/redux/features/categoryApi';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ElectronicCategory = () => {
  const {
    data: categories,
    isLoading,
    isError,
  } = useGetProductTypeCategoryQuery('electronics');
  const router = useRouter();

  // handle category route
  const handleCategoryRoute = title => {
    router.push(
      `/shop?category=${title
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    const category_items = categories.result;
    content = category_items.map(item => (
      <div className="col" key={item._id}>
        <div className="tp-product-category-item text-center mb-40">
          <div className="tp-product-category-thumb fix">
            <a
              className="cursor-pointer"
              onClick={() => handleCategoryRoute(item.parent)}
            >
              <CloudinaryImage
                src={item.img}
                alt={`${item.parent} category`}
                width={160}
                height={160}
                sizes="(max-width: 1024px) 140px, 160px"
                priority={true}
                quality="auto"
                format="auto"
                dpr="auto"
                crop="pad"
                objectFit="contain"
                style={{
                  width: '65%',
                  height: '65%',
                  maxWidth: '65%',
                  transition: 'all 0.35s cubic-bezier(0.24, 0.74, 0.58, 1)',
                }}
                gravity="center"
                // removeBackground={true}
                className="category-image"
              />
            </a>
          </div>
          <div className="tp-product-category-content">
            <h3 className="tp-product-category-title">
              <a
                className="cursor-pointer"
                onClick={() => handleCategoryRoute(item.parent)}
              >
                {item.parent}
              </a>
            </h3>
            <p>{item.products.length} Product</p>
          </div>
        </div>
      </div>
    ));
  }
  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container">
        <div className="row row-cols-xl-5 row-cols-lg-5 row-cols-md-4">
          {content}
        </div>
      </div>
    </section>
  );
};

export default ElectronicCategory;
