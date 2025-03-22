'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../app/product/[id]/product-details.module.css';
// internal
import { Minus, Plus } from '@/svg';
import { decrement, increment } from '@/redux/features/cartSlice';

const ProductQuantity = () => {
  const { orderQuantity } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  // handleIncrease
  const handleIncrease = () => {
    dispatch(increment());
  };

  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement());
  };

  return (
    <>
      <button
        className={styles.quantityButton}
        onClick={handleDecrease}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        className={styles.quantityInput}
        type="text"
        readOnly
        value={orderQuantity}
        aria-label="Product quantity"
      />
      <button
        className={styles.quantityButton}
        onClick={handleIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </>
  );
};

export default ProductQuantity;
