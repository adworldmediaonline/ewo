'use client';
import parentCategoryModified from '@/lib/parentCategory';
import { useGetProductQuery } from '@/redux/features/productApi';

import ErrorMsg from '../common/error-msg';
import PrdDetailsLoader from '../loader/prd-details-loader';
import ProductDetailsContent from './product-details-content';

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
      <div className="">
        <nav aria-label="Breadcrumb" className="">
          <ol className="">
            <li className="">
              <a href="/" className="">
                <span className="">Home</span>
              </a>
            </li>
            <li className="">
              <svg
                className=""
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
              <a href={`/shop?category=${categoryName}`} className="">
                <span className="">{formattedCategoryName}</span>
              </a>
            </li>
            <li className=" " aria-current="page">
              <svg
                className=""
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
              <span className="">{formattedProductTitle}</span>
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
