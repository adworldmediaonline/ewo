'use client';
import React, { useEffect, useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import { useDispatch } from 'react-redux';
// import DOMPurify from 'isomorphic-dompurify';
// import ShowMoreText from 'react-show-more-text';
import styles from '../../app/product/[id]/product-details.module.css';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
// import { titleCaseFirstLetterOfEveryWord } from '@/lib/titleCaseFirstLetterOfEveryWord';

export default function DetailsWrapper({
  productItem,
  handleImageActive,
  activeImg,
}) {
  const {
    sku,
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
    options,
  } = productItem || {};
  const [ratingVal, setRatingVal] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
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

  // Calculate final price based on base price, discount, and selected option
  const calculateFinalPrice = () => {
    const basePrice = Number(price);
    const discountedPrice =
      discount > 0
        ? basePrice - (basePrice * Number(discount)) / 100
        : basePrice;

    // Add option price if an option is selected
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (discountedPrice + optionPrice).toFixed(2);
  };

  // Handle option selection
  const handleOptionChange = e => {
    const optionIndex = e.target.value;
    if (optionIndex === '') {
      setSelectedOption(null);
    } else {
      setSelectedOption(options[parseInt(optionIndex)]);
    }
  };

  // handle add product
  const handleAddProduct = prd => {
    const productToAdd = {
      ...prd,
      selectedOption,
      // If an option is selected, update the final price to include the option price
      finalPrice: selectedOption ? calculateFinalPrice() : undefined,
    };
    dispatch(add_cart_product(productToAdd));
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
  // const createSanitizedHTML = text => {
  //   const sanitizedHTML = DOMPurify.sanitize(text);
  //   return { __html: sanitizedHTML };
  // };
  console.log('Options', options);
  return (
    <>
      {category?.name && (
        <div className={styles.productMeta}>
          <span>Category: {category?.name}</span>
        </div>
      )}

      <h1 className={styles.productTitle}>
        {title}
        {/* {titleCaseFirstLetterOfEveryWord(title)} */}
      </h1>

      <div className={styles.productMeta}>
        <div className={styles.rating}>
          <div className={styles.ratingStars}>
            <Rating
              allowFraction
              size={16}
              initialValue={ratingVal}
              readonly={true}
            />
          </div>
          <span className={styles.ratingCount}>
            ({reviews?.length || 0} Reviews)
          </span>
        </div>

        <div className={styles.productAvailability}>
          Status:
          {status === 'in-stock' ? (
            <span className={styles.inStock}> In Stock</span>
          ) : (
            <span className={styles.outOfStock}> Out of Stock</span>
          )}
        </div>
      </div>

      <div className={styles.productPrice}>
        {discount > 0 ? (
          <>
            <span className={styles.currentPrice}>
              ${calculateFinalPrice()}
            </span>
            <span className={styles.oldPrice}>${price?.toFixed(2)}</span>
            <span className={styles.discount}>{discount}% OFF</span>
          </>
        ) : (
          <span className={styles.currentPrice}>${calculateFinalPrice()}</span>
        )}
        {selectedOption && (
          <div className={styles.optionPriceInfo}>
            {/* Includes ${selectedOption.price} for option: {selectedOption.title} */}
            {selectedOption.title}
          </div>
        )}
      </div>

      {/* <div className={styles.productDescription}>
        {description && (
          <ShowMoreText
            lines={2}
            more="Read More"
            less="Read Less"
            className={styles.showMoreText}
            anchorClass={styles.readMoreBtn}
            expanded={false}
            truncatedEndingComponent={'... '}
          >
            <div dangerouslySetInnerHTML={createSanitizedHTML(description)} />
          </ShowMoreText>
        )}
      </div> */}

      {imageURLs?.some(item => item?.color && item?.color?.name) && (
        <div className={styles.optionsContainer}>
          <h3 className={styles.optionTitle}>Color</h3>
          <div className={styles.colorOptions}>
            {imageURLs
              .filter(item => item?.color && item?.color?.name)
              .map((item, i) => (
                <div
                  onClick={() => handleImageActive(item)}
                  key={i}
                  className={`${styles.colorOption} ${
                    item === activeImg ? styles.colorOptionSelected : ''
                  }`}
                  style={{ backgroundColor: item?.color?.clrCode }}
                  title={item?.color?.name}
                  role="button"
                  tabIndex={0}
                />
              ))}
          </div>
        </div>
      )}

      {offerDate?.endDate && (
        <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />
      )}

      {/* Product Options Section */}
      {options && options.length > 0 && (
        <div className={styles.optionsContainer}>
          <h3 className={styles.optionTitle}>Options</h3>
          <div className={styles.selectOptionContainer}>
            <select
              className={styles.selectOption}
              onChange={handleOptionChange}
              value={
                selectedOption ? options.indexOf(selectedOption).toString() : ''
              }
            >
              <option value="">Select an option</option>
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {option.price && Number(option.price) !== 0
                    ? `${option.title} (+$${Number(option.price).toFixed(2)})`
                    : option.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Options section end here */}

      <div className={styles.quantityAndCart}>
        <div className={styles.quantitySelector}>
          <ProductQuantity />
        </div>
        <button
          onClick={() => handleAddProduct(productItem)}
          disabled={status === 'out-of-stock'}
          className={`${styles.addToCartButton} ${
            status === 'out-of-stock' ? styles.addToCartDisabled : ''
          }`}
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

      <div className={styles.actionButtons}>
        <button
          onClick={() => handleWishlistProduct(productItem)}
          className={styles.actionButton}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 16.5C9 16.5 1.125 12 1.125 5.625C1.125 4.47989 1.58627 3.38145 2.40641 2.56131C3.22655 1.74118 4.32489 1.27991 5.47 1.27991C7.08 1.27991 8.49 2.12991 9 3.36991C9.51 2.12991 10.92 1.27991 12.53 1.27991C13.6751 1.27991 14.7734 1.74118 15.5936 2.56131C16.4137 3.38145 16.875 4.47989 16.875 5.625C16.875 12 9 16.5 9 16.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add to Wishlist
        </button>
        <button
          onClick={() => handleCompareProduct(productItem)}
          className={styles.actionButton}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M14.25 2.25H3.75C2.92157 2.25 2.25 2.92157 2.25 3.75V14.25C2.25 15.0784 2.92157 15.75 3.75 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V3.75C15.75 2.92157 15.0784 2.25 14.25 2.25Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.75 9L8.25 10.5L11.25 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add to Compare
        </button>
      </div>

      {sku && (
        <div className={styles.productMeta}>
          <span>SKU: {sku}</span>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className={styles.productMeta}>
          <span>
            Tags:{' '}
            {tags.map((tag, i) => (
              <span key={i}>
                {tag}
                {i < tags.length - 1 && ', '}
              </span>
            ))}
          </span>
        </div>
      )}
    </>
  );
}
