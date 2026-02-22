'use client';
import React from 'react';
// internal
import { useGetAllProductsQuery } from '@/redux/features/productApi';
import ErrorMsg from '@/components/common/error-msg';
import { ProductCard } from '@/components/version-tsx/product-card';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';
import HomeSmPrdLoader from '@/components/loader/home/home-sm-prd-loader';

const ProductSmArea = () => {
  const { handleAddToCart, handleAddToWishlist } = useShopActions();
  const { data: products, isError, isLoading } = useGetAllProductsQuery({
  publishStatus: 'published',
});
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeSmPrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    const discount_prd = products.data.filter(p => p.discount > 0).slice(0, 3);
    const featured_prd = products.data.filter(p => p.featured).slice(0, 3);
    const selling_prd = products.data
      .slice()
      .sort((a, b) => b.sellCount - a.sellCount)
      .slice(0, 3);

    // Only show sections with products
    const sections = [];

    if (discount_prd.length > 0) {
      sections.push(
        <div key="discount" className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Discount Products
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {discount_prd.map(item => (
                <ProductCard
                  key={item._id}
                  product={item}
                  layout="horizontal"
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (featured_prd.length > 0) {
      sections.push(
        <div key="featured" className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Featured Products
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {featured_prd.map(item => (
                <ProductCard
                  key={item._id}
                  product={item}
                  layout="horizontal"
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selling_prd.length > 0) {
      sections.push(
        <div key="selling" className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Selling Products
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {selling_prd.map(item => (
                <ProductCard
                  key={item._id}
                  product={item}
                  layout="horizontal"
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Only render the section if there are products to show
    content =
      sections.length > 0 ? <div className="row">{sections}</div> : null;
  }

  // Only render the section if there's content to show
  return content ? (
    <section className="tp-product-sm-area">
      <div className="container">{content}</div>
    </section>
  ) : null;
};

export default ProductSmArea;
