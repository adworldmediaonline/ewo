import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
import Link from 'next/link';
// internal
import { Cart, CompareThree, QuickView, Wishlist } from '@/svg';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { handleProductModal } from '@/redux/features/productModalSlice';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';

export default function ProductItem({ product, style_2 = false }) {
  const {
    _id,
    img,
    category,
    title,
    reviews,
    price,
    discount,
    tags,
    status,
    slug,
  } = product || {};
  const [ratingVal, setRatingVal] = useState(0);
  const { cart_products } = useSelector(state => state.cart);
  const { wishlist } = useSelector(state => state.wishlist);
  const isAddedToCart = cart_products.some(prd => prd._id === _id);
  const isAddedToWishlist = wishlist.some(prd => prd._id === _id);
  const dispatch = useDispatch();

  // Calculate pricing with markup and discount
  const increasePriceWithInPercent = 20;
  const discountOnPrice = 15;
  const markedUpPrice = price * (1 + increasePriceWithInPercent / 100); // 20% markup
  const finalSellingPrice = markedUpPrice * (1 - discountOnPrice / 100); // 15% discount on marked up price

  // Create product with updated price for cart/wishlist/compare
  const productWithCalculatedPrice = {
    ...product,
    price: finalSellingPrice,
    originalPrice: price,
    markedUpPrice: markedUpPrice,
  };

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
    dispatch(add_cart_product(productWithCalculatedPrice));
  };
  // handle wishlist product
  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(productWithCalculatedPrice));
  };

  // handle compare product
  const handleCompareProduct = prd => {
    dispatch(add_to_compare(productWithCalculatedPrice));
  };

  return (
    <div className="tp-product-item-2">
      <div className="tp-product-thumb-2 p-relative">
        <Link href={`/product/${slug}`}>
          <CloudinaryImage
            src={img}
            alt={title || 'Product image'}
            width={284}
            height={284}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 284px"
            priority={false}
            quality="auto"
            format="auto"
            dpr="auto"
            crop="pad"
            gravity="center"
            background="white"
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'contain',
              display: 'block',
              transition: 'all 0.3s ease',
              backgroundColor: 'white',
            }}
            className="product-img"
          />
        </Link>
        {status === 'out-of-stock' && (
          <div className="tp-product-badge">
            <span className="product-hot">Out of Stock</span>
          </div>
        )}
        {/* product action */}
        <div className="tp-product-action-2">
          <div className="tp-product-action-item-2 d-flex flex-column">
            <button
              type="button"
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip">Quick View</span>
            </button>
            <button
              type="button"
              onClick={() => handleWishlistProduct(product)}
              className={`tp-product-action-btn-2 tp-product-add-to-wishlist-btn ${
                isAddedToWishlist ? 'active' : ''
              }`}
            >
              <Wishlist />
              <span className="tp-product-tooltip">Add To Wishlist</span>
            </button>
            <button
              disabled={status === 'out-of-stock'}
              onClick={() => handleCompareProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Compare
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="tp-product-content-2">
        {tags && tags.length > 0 && (
          <div className="tp-product-tag-2">
            {tags.map((t, i) => (
              <a key={i} href="#">
                {t}
                {i < tags.length - 1 && ', '}
              </a>
            ))}
          </div>
        )}
        <h3 className="tp-product-title-2">
          <Link href={`/product/${slug}`}>{title}</Link>
        </h3>
        <div className="tp-product-rating-icon tp-product-rating-icon-2">
          <Rating
            allowFraction
            size={16}
            initialValue={ratingVal}
            readonly={true}
          />
        </div>
        <div className="tp-product-price-wrapper-2">
          <div
            className="tp-product-price-info"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {/* Original Price */}
            <span
              className="tp-product-price-2 old-price"
              style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
              }}
            >
              $
              <span style={{ textDecoration: 'line-through' }}>
                {markedUpPrice.toFixed(2)}
              </span>
            </span>

            {/* Current Selling Price */}
            <span
              className="tp-product-price-2 new-price"
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#2c3e50',
                lineHeight: '1.1',
              }}
            >
              ${finalSellingPrice.toFixed(2)}
            </span>

            {/* Savings Information */}
            {/* <div style={{
              fontSize: '11px',
              color: '#28a745',
              fontWeight: '500',
              opacity: '0.9'
            }}>
              You save ${(markedUpPrice - finalSellingPrice).toFixed(2)}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
