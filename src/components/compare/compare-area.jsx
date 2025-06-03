'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
// internal
import { add_cart_product } from '@/redux/features/cartSlice';
import { remove_compare_product } from '@/redux/features/compareSlice';
import styles from './compare-area.module.css';

export default function CompareArea() {
  const { compareItems } = useSelector(state => state.compare);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = prd => {
    dispatch(add_cart_product(prd));
  };

  // handle remove product
  const handleRemoveComparePrd = prd => {
    dispatch(remove_compare_product(prd));
  };

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {compareItems.length === 0 ? (
          <div className={styles.emptyCompare}>
            <div className={styles.emptyCompareContent}>
              <div className={styles.emptyCompareIcon}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 6H3"></path>
                  <path d="M10 12H3"></path>
                  <path d="M10 18H3"></path>
                  <circle cx="17" cy="12" r="3"></circle>
                  <path d="M18.5 10.5L16.5 13.5L15 12"></path>
                </svg>
              </div>
              <h2 className={styles.emptyCompareTitle}>
                No Products to Compare
              </h2>
              <p className={styles.emptyCompareText}>
                Add products to compare their features, prices, and
                specifications side by side.
              </p>
              <Link href="/shop" className={styles.continueShoppingBtn}>
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.compareContent}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h1 className={styles.title}>Product Comparison</h1>
                <p className={styles.itemsCount}>
                  Comparing {compareItems.length}{' '}
                  {compareItems.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>

            {/* Compare Grid */}
            <div className={styles.compareGrid}>
              {compareItems.map((item, index) => (
                <div key={item._id} className={styles.compareCard}>
                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      handleRemoveComparePrd({
                        title: item.title,
                        id: item._id,
                      })
                    }
                    className={styles.removeBtn}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* Product Image */}
                  <div className={styles.productImage}>
                    <Link href={`/product/${item.slug}`}>
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={200}
                        height={200}
                        className={styles.image}
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>
                      <Link href={`/product/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <div className={styles.productPrice}>
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Rating */}
                    <div className={styles.ratingSection}>
                      <Rating
                        allowFraction
                        size={16}
                        initialValue={
                          item.reviews.length > 0
                            ? item.reviews.reduce(
                                (acc, review) => acc + review.rating,
                                0
                              ) / item.reviews.length
                            : 0
                        }
                        readonly={true}
                      />
                      <span className={styles.ratingText}>
                        ({item.reviews.length} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    <div className={styles.productDescription}>
                      <h4>Description</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            item.description ||
                            'High-quality product with excellent features and performance. Perfect for your needs with reliable functionality and modern design.',
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div className={styles.productActions}>
                      <button
                        onClick={() => handleAddProduct(item)}
                        className={styles.addToCartBtn}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </button>
                      <Link
                        href={`/product/${item.slug}`}
                        className={styles.viewDetailsBtn}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className={styles.bottomActions}>
              <Link href="/shop" className={styles.continueShoppingBtn}>
                Add More Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
