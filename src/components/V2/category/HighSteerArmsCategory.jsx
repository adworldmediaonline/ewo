import React from 'react';
import ProductCategoryDisplay from './ProductCategoryDisplay';

function HighSteerArmsCategory() {
  const categories = [
    {
      title: 'DANA 60',
      link: '/shop?category=dana-60',
    },
    {
      title: 'DANA 44',
      link: '/shop?category=dana-44',
    },
  ];

  return (
    <ProductCategoryDisplay title="High Steer Arms" categories={categories} />
  );
}

export default HighSteerArmsCategory;
