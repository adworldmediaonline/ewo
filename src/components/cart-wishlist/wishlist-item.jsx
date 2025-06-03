'use client';
import React from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import { remove_wishlist_product } from '@/redux/features/wishlist-slice';
import styles from './wishlist-item.module.css';

export default function WishlistItem({ product }) {
  const { _id, img, title, price } = product || {};
  const { cart_products } = useSelector(state => state.cart);
  const isAddToCart = cart_products.find(item => item._id === _id);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = prd => {
    dispatch(add_cart_product(prd));
  };

  // handle decrement product
  const handleDecrement = prd => {
    dispatch(quantityDecrement(prd));
  };

  // handle remove product
  const handleRemovePrd = prd => {
    dispatch(remove_wishlist_product(prd));
  };

  return (
    <div className={styles.wishlistItem}>
      <div className={styles.itemContent}>
        {/* Product Image */}
        <div className={styles.itemImage}>
          <Link href={`/product/${_id}`}>
            <Image
              src={img}
              alt={title}
              width={80}
              height={80}
              className={styles.productImage}
            />
          </Link>
        </div>

        {/* Product Info */}
        <div className={styles.itemInfo}>
          <Link href={`/product/${_id}`} className={styles.productTitle}>
            {title}
          </Link>
          <div className={styles.productPrice}>${price.toFixed(2)}</div>
        </div>

        {/* Quantity Controls */}
        <div className={styles.quantitySection}>
          <div className={styles.quantityControls}>
            <button
              onClick={() => handleDecrement(product)}
              className={styles.quantityBtn}
              disabled={!isAddToCart || isAddToCart?.orderQuantity <= 0}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <span className={styles.quantityValue}>
              {isAddToCart ? isAddToCart?.orderQuantity : 0}
            </span>
            <button
              onClick={() => handleAddProduct(product)}
              className={styles.quantityBtn}
            >
              <svg
                width="12"
                height="12"
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

        {/* Actions */}
        <div className={styles.itemActions}>
          <button
            onClick={() => handleAddProduct(product)}
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
          <button
            onClick={() => handleRemovePrd({ title, id: _id })}
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
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
