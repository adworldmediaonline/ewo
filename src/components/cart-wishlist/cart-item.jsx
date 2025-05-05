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
import styles from '../../app/cart/cart.module.css';

const CartItem = ({ product }) => {
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
    <tr className={styles['cart-item']}>
      <td className={styles['cart-product-col']}>
        <div className={styles['cart-product']}>
          <div className={styles['cart-product-img']}>
            <Link href={`/product/${_id}`}>
              <Image src={img} alt={title} width={70} height={100} />
            </Link>
          </div>
          <div className={styles['cart-product-info']}>
            <Link
              href={`/product/${_id}`}
              className={styles['cart-product-title']}
            >
              {title}
            </Link>
            {selectedOption && (
              <div className={styles['cart-product-option']}>
                Option: {selectedOption.title} (+$
                {Number(selectedOption.price).toFixed(2)})
              </div>
            )}
          </div>
        </div>
      </td>
      <td className={styles['cart-price-col']}>
        <span className={styles['cart-price']}>
          ${(price * orderQuantity).toFixed(2)}
        </span>
      </td>
      <td className={styles['cart-quantity-col']}>
        <div className={styles['cart-quantity']}>
          <button
            onClick={() => handleDecrement(product)}
            className={styles['cart-quantity-btn']}
            aria-label="Decrease quantity"
          >
            <Minus />
          </button>
          <input
            className={styles['cart-quantity-input']}
            type="text"
            value={orderQuantity}
            readOnly
          />
          <button
            onClick={() => handleAddProduct(product)}
            className={styles['cart-quantity-btn']}
            aria-label="Increase quantity"
          >
            <Plus />
          </button>
        </div>
      </td>
      <td className={styles['cart-action-col']}>
        <button
          onClick={() => handleRemovePrd({ title, id: _id })}
          className={styles['cart-remove-btn']}
          aria-label="Remove item"
        >
          <Close />
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
