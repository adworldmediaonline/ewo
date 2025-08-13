'use client';
import { useGetRelatedProductsQuery } from '@/redux/features/productApi';
import ProductItem from '../products/fashion/product-item';

const RelatedProducts = ({ id }) => {
  const { data: products, isError, isLoading } = useGetRelatedProductsQuery(id);

  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-loader text-center">
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && isError) {
    content = <p>Error fetching products</p>;
  }

  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <p>No Products found</p>;
  }

  if (!isLoading && !isError && products?.data?.length > 0) {
    // filter products
    const relatedProducts = products.data.filter(p => p._id !== id).slice(0, 4);

    content = (
      <div className="">
        <h2 className="">Related Products</h2>
        <div className="">
          {relatedProducts.map(product => (
            <div key={product._id} className="">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return content;
};

export default RelatedProducts;
