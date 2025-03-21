'use client';
import React from 'react';
import PrdDetailsLoader from '../loader/prd-details-loader';
import ErrorMsg from '../common/error-msg';
import ProductDetailsBreadcrumb from '../breadcrumb/product-details-breadcrumb';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsContent from './product-details-content';

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
    console.log(product);
    content = (
      <>
        <ProductDetailsBreadcrumb
          category={product.category.name}
          title={product.title}
        />
        <ProductDetailsContent productItem={product} />
      </>
    );
  }
  return <>{content}</>;
};

export default ProductDetailsArea;
