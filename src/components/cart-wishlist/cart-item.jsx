'use client';
import React from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
// internal
import { Close, Minus, Plus } from '@/svg';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import styles from './cart-item.module.css';

export default function CartItem({ product }) {
  const {
    _id,
    img,
    title,
    price,
    orderQuantity = 0,
    selectedOption,
  } = product || {};

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
    dispatch(remove_product(prd));
  };

  return (
    <div className={styles.cartItem}>
      <div className={styles.itemContent}>
        <div className={styles.productSection}>
          <div className={styles.productImage}>
            <Link href={`/product/${_id}`}>
              <Image src={img} alt={title} width={80} height={80} />
            </Link>
          </div>
          <div className={styles.productInfo}>
            <Link href={`/product/${_id}`} className={styles.productTitle}>
              {title}
            </Link>
            {selectedOption && (
              <div className={styles.productOption}>
                Option: {selectedOption.title} (+$
                {Number(selectedOption.price).toFixed(2)})
              </div>
            )}
            <div className={styles.unitPrice}>${price.toFixed(2)} each</div>
          </div>
        </div>

        <div className={styles.quantitySection}>
          <label className={styles.quantityLabel}>Quantity</label>
          <div className={styles.quantityControls}>
            <button
              onClick={() => handleDecrement(product)}
              className={styles.quantityBtn}
              aria-label="Decrease quantity"
            >
              <Minus />
            </button>
            <input
              className={styles.quantityInput}
              type="text"
              value={orderQuantity}
              readOnly
            />
            <button
              onClick={() => handleAddProduct(product)}
              className={styles.quantityBtn}
              aria-label="Increase quantity"
            >
              <Plus />
            </button>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.totalPrice}>
            ${(price * orderQuantity).toFixed(2)}
          </div>
          <button
            onClick={() => handleRemovePrd({ title, id: _id })}
            className={styles.removeBtn}
            aria-label="Remove item"
          >
            <Close />
          </button>
        </div>
      </div>
    </div>
  );
}
