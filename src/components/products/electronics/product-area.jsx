'use client';
import React, { useState } from 'react';
import { useGetAllProductsQuery } from '@/redux/features/productApi';
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';

const tabs = ['new', 'featured', 'topSellers'];

const ProductArea = () => {
  const [activeTab, setActiveTab] = useState('new');
  const { data: products, isError, isLoading } = useGetAllProductsQuery();

  // handleActiveTab
  const handleActiveTab = tab => {
    setActiveTab(tab);
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    // content = (
    //   <div
    //     className="text-red"
    //     style={{ fontSize: '120px', fontWeight: 'bold' }}
    //   >
    //     Loading...
    //   </div>
    // );
    content = <HomePrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    let filteredProducts = [...products.data];

    // Filter products based on active tab
    switch (activeTab) {
      case 'new':
        filteredProducts = filteredProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);
        break;
      case 'featured':
        filteredProducts = filteredProducts.filter(p => p.featured).slice(0, 8);
        break;
      case 'topSellers':
        filteredProducts = filteredProducts
          .sort((a, b) => b.sellCount - a.sellCount)
          .slice(0, 8);
        break;
      default:
        break;
    }

    content = filteredProducts.map((prd, i) => (
      <div key={i} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={prd} />
      </div>
    ));
  }
  return (
    <section className="tp-product-area pb-55">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-5 col-lg-6 col-md-5">
            <div className="mb-40 tp-section-title-wrapper">
              <h3 className="tp-section-title">Trending Products</h3>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-7">
            <div className="tp-product-tab tp-product-tab-border mb-45 tp-tab d-flex justify-content-md-end">
              <ul className="nav nav-tabs justify-content-sm-end">
                {tabs.map((tab, i) => (
                  <li key={i} className="nav-item">
                    <button
                      onClick={() => handleActiveTab(tab)}
                      className={`nav-link text-capitalize ${
                        activeTab === tab ? 'active' : ''
                      }`}
                    >
                      {tab.split('-').join(' ')}
                      <span className="tp-product-tab-line"></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="row">{content}</div>
      </div>
    </section>
  );
};

export default ProductArea;
