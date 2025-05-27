import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import { Rating } from 'react-simple-star-rating';
import CloudinaryImage from '../CloudinaryImage';
import { handleModalClose } from '@/redux/features/productModalSlice';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import {
  increment,
  decrement,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { notifyError, notifySuccess } from '@/utils/toast';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    padding: '10px',
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '1100px',
    width: '100%',
    maxHeight: '95vh',
    margin: '0 auto',
    padding: '0',
    border: 'none',
    background: '#fff',
    overflow: 'hidden',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '16px',
    outline: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
};

export default function QuickViewModal() {
  const { productItem, isModalOpen } = useSelector(state => state.productModal);
  const { orderQuantity, cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  const {
    _id,
    sku,
    title,
    img,
    imageURLs,
    category,
    description,
    discount,
    price,
    status,
    reviews,
    tags,
    options,
  } = productItem || {};

  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);
  const [selectedOption, setSelectedOption] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
    dispatch(initialOrderQuantity());
    setSelectedOption(null);
  }, [img, imageURLs, dispatch]);

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

  const calculateFinalPrice = () => {
    const basePrice = Number(price);
    const discountedPrice =
      discount > 0
        ? basePrice - (basePrice * Number(discount)) / 100
        : basePrice;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (discountedPrice + optionPrice).toFixed(2);
  };

  const handleOptionChange = e => {
    const optionIndex = e.target.value;
    if (optionIndex === '') {
      setSelectedOption(null);
    } else {
      setSelectedOption(options[parseInt(optionIndex)]);
    }
  };

  const handleAddProduct = prd => {
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    const existingProduct = cart_products.find(item => item._id === prd._id);
    const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
    const totalRequestedQty = currentQty + orderQuantity;

    if (prd.quantity && totalRequestedQty > prd.quantity) {
      notifyError(
        `Sorry, only ${prd.quantity} items available. You already have ${currentQty} in your cart.`
      );
      return;
    }

    const productToAdd = {
      ...prd,
      selectedOption,
      finalPrice: selectedOption ? calculateFinalPrice() : undefined,
    };

    dispatch(add_cart_product(productToAdd));
    notifySuccess('Product added to cart successfully!');
  };

  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
    notifySuccess('Product added to wishlist!');
  };

  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
    notifySuccess('Product added to compare!');
  };

  const handleImageActive = url => {
    setActiveImg(url);
  };

  return (
    <ReactModal
      isOpen={isModalOpen}
      onRequestClose={() => dispatch(handleModalClose())}
      appElement={document.getElementById('__next')}
      ariaHideApp={false}
      style={customStyles}
      contentLabel="Quick View Product"
    >
      <div className="quick-view-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Quick View</h2>
          <button
            onClick={() => dispatch(handleModalClose())}
            type="button"
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Image Gallery */}
          <div className="image-section">
            <div className="main-image">
              <CloudinaryImage
                src={activeImg}
                alt={title}
                width={500}
                height={500}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                crop="pad"
                gravity="center"
              />
              {status === 'out-of-stock' && (
                <div className="stock-badge">Out of Stock</div>
              )}
            </div>

            {imageURLs && imageURLs.length > 1 && (
              <div className="thumbnail-gallery">
                <div className="swipe-hint">
                  <span>Swipe to see more images</span>
                </div>
                {imageURLs.map((url, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${url === activeImg ? 'active' : ''}`}
                    onClick={() => handleImageActive(url)}
                    type="button"
                  >
                    <CloudinaryImage
                      src={url}
                      alt={`${title} ${i + 1}`}
                      width={80}
                      height={80}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      crop="pad"
                      gravity="center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="scrollable-content">
              {category?.name && (
                <div className="product-category">{category.name}</div>
              )}

              <h1 className="product-title">{title}</h1>

              <div className="product-meta">
                <div className="rating-section">
                  <Rating
                    allowFraction
                    size={18}
                    initialValue={ratingVal}
                    readonly={true}
                  />
                  <span className="rating-count">
                    ({reviews?.length || 0} reviews)
                  </span>
                </div>

                <div className="availability">
                  <span className="availability-label">Availability:</span>
                  <span
                    className={`availability-status ${
                      status === 'in-stock' ? 'in-stock' : 'out-of-stock'
                    }`}
                  >
                    {status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {sku && (
                  <div className="sku">
                    <span className="sku-label">SKU:</span>
                    <span className="sku-value">{sku}</span>
                  </div>
                )}
              </div>

              <div className="price-section">
                {discount > 0 ? (
                  <div className="price-with-discount">
                    <span className="current-price">
                      ${calculateFinalPrice()}
                    </span>
                    <span className="original-price">${price?.toFixed(2)}</span>
                    <span className="discount-badge">{discount}% OFF</span>
                  </div>
                ) : (
                  <span className="current-price">
                    ${calculateFinalPrice()}
                  </span>
                )}
                {selectedOption && (
                  <div className="option-info">
                    Selected: {selectedOption.title}
                  </div>
                )}
              </div>

              {description && (
                <div className="product-description">
                  <p>{description.substring(0, 150)}...</p>
                </div>
              )}

              {/* Options */}
              {options && options.length > 0 && (
                <div className="options-section">
                  <label className="options-label">Choose Option:</label>
                  <select
                    className="options-select"
                    value={
                      selectedOption ? options.indexOf(selectedOption) : ''
                    }
                    onChange={handleOptionChange}
                  >
                    <option value="">Select an option</option>
                    {options.map((option, index) => (
                      <option key={index} value={index}>
                        {option.title} (+${option.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Options */}
              {imageURLs?.some(item => item?.color && item?.color?.name) && (
                <div className="color-options">
                  <label className="color-label">Color:</label>
                  <div className="color-swatches">
                    {imageURLs
                      .filter(item => item?.color && item?.color?.name)
                      .map((item, i) => (
                        <button
                          key={i}
                          className={`color-swatch ${
                            item.img === activeImg ? 'active' : ''
                          }`}
                          onClick={() => handleImageActive(item.img)}
                          style={{ backgroundColor: item.color.clrCode }}
                          title={item.color.name}
                          type="button"
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quantity-section">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn quantity-decrease"
                    onClick={() => dispatch(decrement())}
                    disabled={orderQuantity <= 1}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <div className="quantity-display">
                    <span className="quantity-value">{orderQuantity}</span>
                  </div>
                  <button
                    className="quantity-btn quantity-increase"
                    onClick={() => {
                      if (productItem?.quantity) {
                        const existingProduct = cart_products.find(
                          item => item._id === productItem._id
                        );
                        const currentQty = existingProduct
                          ? existingProduct.orderQuantity
                          : 0;
                        const totalRequestedQty =
                          currentQty + orderQuantity + 1;

                        if (totalRequestedQty > productItem.quantity) {
                          notifyError(
                            `Sorry, only ${productItem.quantity} items available. You already have ${currentQty} in your cart.`
                          );
                          return;
                        }
                      }
                      dispatch(increment());
                    }}
                    type="button"
                    aria-label="Increase quantity"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="tags-section">
                  <span className="tags-label">Tags:</span>
                  <div className="tags">
                    {tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Buttons */}
            <div className="sticky-actions">
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddProduct(productItem)}
                disabled={status === 'out-of-stock'}
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="btn-text">Add to Cart</span>
              </button>

              <div className="secondary-actions">
                <button
                  className="wishlist-btn"
                  onClick={() => handleWishlistProduct(productItem)}
                  type="button"
                  title="Add to Wishlist"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                  </svg>
                  <span className="btn-text-mobile">Wishlist</span>
                </button>

                <button
                  className="compare-btn"
                  onClick={() => handleCompareProduct(productItem)}
                  type="button"
                  title="Add to Compare"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                    <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"></path>
                  </svg>
                  <span className="btn-text-mobile">Compare</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .quick-view-modal {
            height: 100%;
            display: flex;
            flex-direction: column;
            font-family: 'Lato', sans-serif;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid #e5e7eb;
            background: #fafafa;
          }

          .modal-title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin: 0;
          }

          .modal-close-btn {
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
            color: #6b7280;
          }

          .modal-close-btn:hover {
            background: #f3f4f6;
            color: #111827;
          }

          .modal-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding: 32px;
            overflow-y: auto;
            flex: 1;
          }

          .image-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .main-image {
            position: relative;
            aspect-ratio: 1;
            background: #f9fafb;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }

          .stock-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: #ef4444;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .thumbnail-gallery {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 4px;
            position: relative;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          .swipe-hint {
            display: none;
            position: absolute;
            top: -24px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
          }

          .thumbnail {
            flex-shrink: 0;
            width: 80px;
            height: 80px;
            border: 2px solid transparent;
            border-radius: 8px;
            overflow: hidden;
            background: #f9fafb;
            cursor: pointer;
            transition: all 0.2s;
          }

          .thumbnail:hover {
            border-color: #d1d5db;
          }

          .thumbnail.active {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }

          .product-info {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }

          .scrollable-content {
            flex: 1;
            overflow-y: auto;
            padding-right: 8px;
            margin-right: -8px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding-bottom: 20px;
          }

          .product-category {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .product-title {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            line-height: 1.2;
            margin: 0;
          }

          .product-meta {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .rating-section {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .rating-count {
            color: #6b7280;
            font-size: 14px;
          }

          .availability,
          .sku {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .availability-label,
          .sku-label {
            color: #6b7280;
            font-weight: 500;
          }

          .availability-status.in-stock {
            color: #059669;
            font-weight: 600;
          }

          .availability-status.out-of-stock {
            color: #dc2626;
            font-weight: 600;
          }

          .sku-value {
            color: #111827;
            font-weight: 500;
          }

          .price-section {
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
          }

          .price-with-discount {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .current-price {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
          }

          .original-price {
            font-size: 20px;
            color: #6b7280;
            text-decoration: line-through;
          }

          .discount-badge {
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }

          .option-info {
            margin-top: 8px;
            color: #6b7280;
            font-size: 14px;
          }

          .product-description {
            color: #6b7280;
            line-height: 1.6;
          }

          .options-section,
          .color-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .options-label,
          .color-label {
            font-weight: 600;
            color: #111827;
          }

          .options-select {
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            cursor: pointer;
          }

          .options-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .color-swatches {
            display: flex;
            gap: 8px;
          }

          .color-swatch {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e7eb;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
          }

          .color-swatch:hover {
            transform: scale(1.1);
          }

          .color-swatch.active {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }

          .quantity-section {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .quantity-label {
            font-weight: 600;
            color: #111827;
            min-width: 70px;
          }

          .quantity-selector {
            display: flex;
            align-items: center;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            overflow: hidden;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .quantity-selector:hover {
            border-color: #d1d5db;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .quantity-selector:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .quantity-btn {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border: none;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
          }

          .quantity-btn:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: scale(1.05);
          }

          .quantity-btn:active:not(:disabled) {
            transform: scale(0.95);
          }

          .quantity-btn:disabled {
            background: #f3f4f6;
            color: #d1d5db;
            cursor: not-allowed;
            opacity: 0.5;
          }

          .quantity-decrease {
            border-radius: 10px 0 0 10px;
          }

          .quantity-increase {
            border-radius: 0 10px 10px 0;
          }

          .quantity-display {
            min-width: 60px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
          }

          .quantity-value {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            user-select: none;
          }

          .sticky-actions {
            position: sticky;
            bottom: 0;
            background: white;
            border-top: 1px solid #e5e7eb;
            padding: 16px 0;
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10;
          }

          .add-to-cart-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
          }

          .add-to-cart-btn:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-1px);
          }

          .add-to-cart-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }

          .secondary-actions {
            display: flex;
            gap: 12px;
          }

          .wishlist-btn,
          .compare-btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 14px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .wishlist-btn:hover,
          .compare-btn:hover {
            background: #e5e7eb;
            color: #111827;
          }

          .btn-text-mobile {
            display: none;
          }

          .tags-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .tags-label {
            font-weight: 600;
            color: #111827;
          }

          .tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }

          /* Tablet styles */
          @media (max-width: 1024px) {
            .modal-content {
              gap: 32px;
              padding: 24px;
            }

            .product-title {
              font-size: 26px;
            }

            .current-price {
              font-size: 30px;
            }
          }

          /* Mobile landscape */
          @media (max-width: 768px) {
            .quick-view-modal {
              height: 100vh;
            }

            .modal-content {
              grid-template-columns: 1fr;
              gap: 20px;
              padding: 16px;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }

            .modal-header {
              padding: 16px;
              position: sticky;
              top: 0;
              z-index: 10;
              background: #fafafa;
              border-bottom: 1px solid #e5e7eb;
            }

            .modal-title {
              font-size: 18px;
            }

            .image-section {
              order: 1;
            }

            .product-info {
              order: 2;
              height: auto;
              overflow: visible;
            }

            .scrollable-content {
              gap: 16px;
              overflow-y: visible;
              padding-right: 0;
              margin-right: 0;
            }

            .sticky-actions {
              position: sticky;
              bottom: 0;
              background: white;
              border-top: 1px solid #e5e7eb;
              padding: 16px;
              margin: 0 -16px;
              box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
            }

            .product-title {
              font-size: 22px;
              line-height: 1.3;
            }

            .current-price {
              font-size: 26px;
            }

            .original-price {
              font-size: 18px;
            }

            .sticky-actions {
              padding: 12px;
              margin: 0 -12px;
            }

            .add-to-cart-btn {
              padding: 16px 24px;
              font-size: 16px;
            }

            .wishlist-btn,
            .compare-btn {
              padding: 16px;
              flex: 1;
            }

            .btn-text-mobile {
              display: inline;
              font-size: 14px;
              font-weight: 500;
            }

            .thumbnail-gallery {
              justify-content: flex-start;
              padding: 8px 0;
              padding-top: 32px;
            }

            .swipe-hint {
              display: block;
            }

            .thumbnail {
              width: 70px;
              height: 70px;
            }

            .main-image {
              border-radius: 8px;
            }

            .price-section {
              padding: 16px 0;
            }

            .product-meta {
              gap: 10px;
            }

            .options-select {
              padding: 14px 12px;
              font-size: 16px;
            }

            .quantity-section {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }

            .quantity-label {
              min-width: auto;
            }

            .quantity-selector {
              border-radius: 10px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }

            .quantity-btn {
              width: 44px;
              height: 44px;
            }

            .quantity-display {
              min-width: 70px;
              height: 44px;
            }

            .quantity-value {
              font-size: 18px;
            }
          }

          /* Mobile portrait */
          @media (max-width: 480px) {
            .modal-header {
              padding: 12px 16px;
            }

            .modal-title {
              font-size: 16px;
            }

            .modal-close-btn {
              padding: 6px;
            }

            .modal-content {
              padding: 12px;
              gap: 16px;
            }

            .product-title {
              font-size: 20px;
            }

            .current-price {
              font-size: 24px;
            }

            .original-price {
              font-size: 16px;
            }

            .discount-badge {
              font-size: 10px;
              padding: 3px 6px;
            }

            .thumbnail {
              width: 60px;
              height: 60px;
            }

            .thumbnail-gallery {
              gap: 6px;
            }

            .color-swatch {
              width: 28px;
              height: 28px;
            }

            .add-to-cart-btn {
              padding: 14px 20px;
              font-size: 15px;
            }

            .wishlist-btn,
            .compare-btn {
              padding: 14px;
            }

            .product-category {
              font-size: 12px;
            }

            .rating-count,
            .availability,
            .sku {
              font-size: 13px;
            }

            .product-description {
              font-size: 14px;
            }

            .options-label,
            .color-label,
            .quantity-label {
              font-size: 14px;
            }

            .quantity-btn {
              width: 42px;
              height: 42px;
            }

            .quantity-display {
              min-width: 65px;
              height: 42px;
            }

            .quantity-value {
              font-size: 16px;
            }

            .tag {
              font-size: 11px;
              padding: 3px 6px;
            }

            .stock-badge {
              top: 12px;
              left: 12px;
              padding: 4px 8px;
              font-size: 10px;
            }

            .price-section {
              padding: 12px 0;
            }

            .scrollable-content {
              gap: 14px;
            }

            .sticky-actions {
              padding: 10px;
              margin: 0 -8px;
            }

            .product-meta {
              gap: 8px;
            }
          }

          /* Extra small screens */
          @media (max-width: 360px) {
            .modal-content {
              padding: 8px;
            }

            .modal-header {
              padding: 10px 12px;
            }

            .product-title {
              font-size: 18px;
            }

            .current-price {
              font-size: 22px;
            }

            .thumbnail {
              width: 50px;
              height: 50px;
            }

            .sticky-actions {
              gap: 8px;
              padding: 8px;
              margin: 0 -8px;
            }

            .add-to-cart-btn {
              padding: 12px 16px;
              font-size: 14px;
            }

            .wishlist-btn,
            .compare-btn {
              padding: 12px;
            }
          }

          /* Landscape orientation on mobile */
          @media (max-height: 600px) and (orientation: landscape) {
            .quick-view-modal {
              height: 100vh;
            }

            .modal-content {
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              padding: 12px;
              overflow-y: auto;
            }

            .modal-header {
              padding: 8px 12px;
            }

            .modal-title {
              font-size: 16px;
            }

            .product-title {
              font-size: 18px;
            }

            .current-price {
              font-size: 20px;
            }

            .image-section {
              order: 1;
            }

            .product-info {
              order: 2;
              gap: 12px;
            }

            .thumbnail-gallery {
              display: none;
            }

            .sticky-actions {
              flex-direction: row;
              gap: 8px;
              padding: 8px 12px;
              margin: 0 -12px;
            }

            .add-to-cart-btn {
              padding: 10px 16px;
              font-size: 13px;
            }

            .wishlist-btn,
            .compare-btn {
              padding: 10px;
            }
          }

          /* Touch device optimizations */
          @media (hover: none) and (pointer: coarse) {
            .thumbnail:hover {
              border-color: transparent;
            }

            .color-swatch:hover {
              transform: none;
            }

            .modal-close-btn:hover {
              background: none;
            }

            .add-to-cart-btn:hover:not(:disabled) {
              background: #3b82f6;
              transform: none;
            }

            .wishlist-btn:hover,
            .compare-btn:hover {
              background: #f3f4f6;
            }

            /* Increase touch targets */
            .thumbnail {
              min-height: 44px;
              min-width: 44px;
            }

            .color-swatch {
              min-height: 44px;
              min-width: 44px;
            }

            .modal-close-btn {
              min-height: 44px;
              min-width: 44px;
            }

            .quantity-btn {
              min-height: 44px;
              min-width: 44px;
            }

            .quantity-btn:hover:not(:disabled) {
              background: #f8fafc;
              color: #6b7280;
              transform: none;
            }

            .quantity-btn:active:not(:disabled) {
              background: #3b82f6;
              color: white;
              transform: scale(0.95);
            }
          }
        `}</style>
      </div>
    </ReactModal>
  );
}
