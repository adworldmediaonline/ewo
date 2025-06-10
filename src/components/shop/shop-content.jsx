'use client';
import React, { useState } from 'react';
import Pagination from '@/ui/Pagination';
import CategoryFilter from './shop-filter/category-filter';
// import PriceFilter from './shop-filter/price-filter';
import StatusFilter from './shop-filter/status-filter';
import TopRatedProducts from './shop-filter/top-rated-products';
// import ShopListItem from './shop-list-item';
import ShopTopLeft from './shop-top-left';
import ShopTopRight from './shop-top-right';
import ResetButton from './shop-filter/reset-button';
import styles from '../../app/shop/shop.module.css';
import ProductItemWrapper from './product-item-wrapper';

const ShopContent = ({
  all_products,
  products,
  otherProps,
  shop_right,
  hidden_sidebar,
}) => {
  const { priceFilterValues, selectHandleFilter, currPage, setCurrPage } =
    otherProps;
  const { setPriceValue } = priceFilterValues || {};
  const [filteredRows, setFilteredRows] = useState(products);
  const [pageStart, setPageStart] = useState(0);
  const [countOfPage, setCountOfPage] = useState(50);

  const paginatedData = (items, startPage, pageCount) => {
    setFilteredRows(items);
    setPageStart(startPage);
    setCountOfPage(pageCount);
  };

  // max price
  const maxPrice = all_products.reduce((max, product) => {
    return product.price > max ? product.price : max;
  }, 0);

  return (
    <div className={styles.shopSection}>
      <div className={styles.shopContentContainer}>
        <div className={styles.shopLayout}>
          {!shop_right && !hidden_sidebar && (
            <div className={`d-none d-lg-block ${styles.shopSidebar}`}>
              <div className={styles.filterSection}>
                {/* filter */}
                {/* <PriceFilter
                  priceFilterValues={priceFilterValues}
                  maxPrice={maxPrice}
                /> */}
                {/* status */}
                <StatusFilter setCurrPage={setCurrPage} />
                {/* categories */}
                <CategoryFilter setCurrPage={setCurrPage} />
                {/* product rating */}
                <TopRatedProducts />
                {/* reset filter */}
                <ResetButton
                  setPriceValues={setPriceValue}
                  maxPrice={maxPrice}
                />
              </div>
            </div>
          )}

          <div className={styles.shopMainContent}>
            <div className={styles.shopTopBar}>
              <div>
                <ShopTopLeft
                  showing={
                    products.length === 0
                      ? 0
                      : filteredRows.slice(pageStart, pageStart + countOfPage)
                          .length
                  }
                  total={all_products.length}
                />
              </div>
              <div>
                <ShopTopRight selectHandleFilter={selectHandleFilter} />
              </div>
            </div>

            {products.length === 0 && (
              <div className={styles.noProducts}>No products found</div>
            )}

            {products.length > 0 && (
              <div className={styles.productsWrapper}>
                <div className={styles.productGrid}>
                  {filteredRows
                    .slice(pageStart, pageStart + countOfPage)
                    .map((item, i) => (
                      <div key={i} className={styles.productGridItem}>
                        <ProductItemWrapper product={item} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div className={styles.pagination}>
                <Pagination
                  items={products}
                  countOfPage={50}
                  paginatedData={paginatedData}
                  currPage={currPage}
                  setCurrPage={setCurrPage}
                />
              </div>
            )}
          </div>

          {shop_right && (
            <div className={`d-none d-lg-block ${styles.shopSidebar}`}>
              <div className={styles.filterSection}>
                {/* filter */}
                {/* <PriceFilter
                  priceFilterValues={priceFilterValues}
                  maxPrice={maxPrice}
                /> */}
                {/* status */}
                <StatusFilter setCurrPage={setCurrPage} />
                {/* categories */}
                <CategoryFilter setCurrPage={setCurrPage} />
                {/* product rating */}
                <TopRatedProducts />
                {/* reset filter */}
                <ResetButton
                  setPriceValues={setPriceValue}
                  maxPrice={maxPrice}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopContent;
