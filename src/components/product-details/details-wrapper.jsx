'use client';
import React, { useEffect, useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import styles from './ProductDetailsContent.module.css';
// internal
// import { AskQuestion, CompareTwo, WishlistTwo } from '@/svg';
// import DetailsBottomInfo from './details-bottom-info';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { handleModalClose } from '@/redux/features/productModalSlice';

const DetailsWrapper = ({
  productItem,
  handleImageActive,
  activeImg,
  detailsBottom = false,
}) => {
  const {
    sku,
    img,
    title,
    imageURLs,
    category,
    description,
    discount,
    price,
    status,
    reviews,
    tags,
    offerDate,
  } = productItem || {};
  const [ratingVal, setRatingVal] = useState(0);
  const [textMore, setTextMore] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // handle add product
  const handleAddProduct = prd => {
    dispatch(add_cart_product(prd));
  };

  // handle wishlist product
  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
  };

  // Sanitize and create description HTML
  const createSanitizedHTML = text => {
    const sanitizedHTML = DOMPurify.sanitize(text);
    return { __html: sanitizedHTML };
  };

  // Get truncated description
  const getTruncatedDescription = () => {
    if (!description) return '';
    return createSanitizedHTML(description);
  };

  return (
    <div className={styles.productInfo}>
      <div className={styles.category}>{category?.name}</div>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.statusRow}>
        <div
          className={`${styles.status} ${
            status === 'in-stock' ? styles.inStock : styles.outOfStock
          }`}
        >
          {status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
        </div>
        <div className={styles.rating}>
          <div className={styles.ratingStars}>
            <Rating
              allowFraction
              size={16}
              initialValue={ratingVal}
              readonly={true}
            />
          </div>
          <span className={styles.reviewCount}>
            ({reviews?.length || 0} Reviews)
          </span>
        </div>
      </div>

      <div className={styles.description}>
        <span
          className={!textMore ? styles.truncated : ''}
          dangerouslySetInnerHTML={getTruncatedDescription()}
        />
        {description && description.length > 80 && (
          <button
            onClick={() => setTextMore(!textMore)}
            className={styles.showMoreBtn}
            type="button"
          >
            {textMore ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      <div className={styles.priceWrapper}>
        {discount > 0 ? (
          <>
            <span className={styles.oldPrice}>${price}</span>
            <span className={styles.price}>
              $
              {(
                Number(price) -
                (Number(price) * Number(discount)) / 100
              ).toFixed(2)}
            </span>
          </>
        ) : (
          <span className={styles.price}>${price?.toFixed(2)}</span>
        )}
      </div>

      {imageURLs?.some(item => item?.color && item?.color?.name) && (
        <div className={styles.variations}>
          <h4 className={styles.variationTitle}>Color</h4>
          <div className={styles.colorList}>
            {imageURLs.map((item, i) => (
              <button
                onClick={() => handleImageActive(item)}
                key={i}
                type="button"
                className={`${styles.colorBtn} ${
                  item?.img === activeImg ? styles.active : ''
                }`}
                style={{ backgroundColor: item?.color?.clrCode }}
              >
                {item?.color?.name && (
                  <span className={styles.colorTooltip}>
                    {item?.color?.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {offerDate?.endDate && (
        <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />
      )}

      <div className={styles.actions}>
        <h3 className={styles.actionTitle}>Quantity</h3>
        <div className={styles.mainActions}>
          <ProductQuantity />
          <button
            onClick={() => handleAddProduct(productItem)}
            disabled={status === 'out-of-stock'}
            className={styles.addToCartBtn}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.25 16.25C6.94036 16.25 7.5 15.6904 7.5 15C7.5 14.3096 6.94036 13.75 6.25 13.75C5.55964 13.75 5 14.3096 5 15C5 15.6904 5.55964 16.25 6.25 16.25Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M15 16.25C15.6904 16.25 16.25 15.6904 16.25 15C16.25 14.3096 15.6904 13.75 15 13.75C14.3096 13.75 13.75 14.3096 13.75 15C13.75 15.6904 14.3096 16.25 15 16.25Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M2.5 3.75H3.75L5.8 11.25H15.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.8 8.75H15.2L16.25 5H4.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add to Cart
          </button>
        </div>

        <Link href="/cart" onClick={() => dispatch(handleModalClose())}>
          <button className={styles.buyNowBtn}>Buy Now</button>
        </Link>

        <div className={styles.secondaryActions}>
          <button
            disabled={status === 'out-of-stock'}
            onClick={() => handleCompareProduct(productItem)}
            className={styles.secondaryBtn}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.25 5H17.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.25 10H17.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.25 15H17.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 5H3.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 10H3.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 15H3.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Compare
          </button>
          <button
            disabled={status === 'out-of-stock'}
            onClick={() => handleWishlistProduct(productItem)}
            className={styles.secondaryBtn}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 17.5C10 17.5 2.5 12.5 2.5 7.5C2.5 4.5 5 2.5 7.5 2.5C8.95 2.5 10.25 3.25 11.25 4.37C12.25 3.25 13.55 2.5 15 2.5C17.5 2.5 20 4.5 20 7.5C20 12.5 12.5 17.5 12.5 17.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add to Wishlist
          </button>
        </div>
      </div>

      {detailsBottom && (
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>SKU:</span>
            {sku}
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Category:</span>
            {category?.name}
          </div>
          {tags?.[0] && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Tags:</span>
              {tags.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailsWrapper;
